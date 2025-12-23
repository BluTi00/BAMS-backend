import 'dotenv/config'
import { Worker } from 'bullmq'
import { redisConnection } from '../redisConnection'
import OpenAI from 'openai'
import { applicationRawData } from './applicationRawDataForBatching'
import fs from 'fs'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const worker = new Worker(
  'normalizationQueue',
  async (job) => {
    const batchNumber = job.data.batchNumber
    const perBatch = 40

    const batch = applicationRawData.slice(
      batchNumber * perBatch,
      (batchNumber + 1) * perBatch
    )

    if (batch.length === 0) {
      console.log(`Batch ${batchNumber} is empty. Skipping...`)
      return
    }

    console.log(
      `Batch ${batchNumber}: Sending ${batch.length} records for normalization...`
    )

    // // TESTING
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    // fs.writeFileSync(
    //   `./input_data_batch_${batchNumber}.json`,
    //   JSON.stringify(batch, null, 2),
    //   { encoding: 'utf-8' }
    // )

    // return

    // END TESTING

    const systemPrompt = `
    You are a data-normalization assistant.

For each record:

1. Read "firmNameEnglish".
2. Read "firmCompanyIndustryNameNp".
3. Transliterate ONLY "firmNameEnglish" into Nepali → output as "translatedFirmName".
4. Copy the original Nepali field exactly as it is → output as "originalFirmNepaliName".

OUTPUT FORMAT (strict):

[
  {
    "applicationCode": "",
    "firmNameEnglish": "",
    "translatedFirmName": "",
    "originalFirmNepaliName": ""
  }
]

RULES:
- Always output ALL records.
- NEVER drop the "originalFirmNepaliName" field.
- No English letters A–Z or a-z may appear anywhere in "translatedFirmName".
- Copy the original Nepali field exactly, even if empty, incorrect, or human names.
- Do NOT add explanations or comments.
- Keep the JSON array structure exactly.
    `

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify(batch),
        },
      ],
    })

    // console.log('Full API response:', JSON.stringify(response, null, 2))

    // Parse the AI response
    const contentBlocks = (response?.output[0] as any)?.content ?? []
    let aiText: string | undefined = undefined

    for (const block of contentBlocks) {
      if (block.type === 'output_text' && block.text) {
        // Remove ```json formatting if present
        aiText = block.text.replace(/```json|```/g, '').trim()
        break
      }
    }

    if (!aiText) {
      console.error('No usable text found in AI response:', response.output)
      throw new Error('No usable AI output found.')
    }

    let cleanedRecords: any[] = []
    try {
      cleanedRecords = JSON.parse(aiText)
    } catch (error) {
      console.error('Error parsing AI response:', error, aiText)
      throw new Error('Failed to parse AI output as JSON.')
    }

    // Write cleaned records to a file
    const outputPath = './cleaned_data.json'

    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, '[]', 'utf-8')
    }

    const currentData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))

    // Add new batch results
    currentData.push(...cleanedRecords)

    // Save back
    fs.writeFileSync(outputPath, JSON.stringify(currentData, null, 2), 'utf-8')

    return
  },
  {
    connection: redisConnection,
    concurrency: 4,
    // Time BullMQ considers a job “active” before thinking it stalled
    lockDuration: 1000 * 60 * 12, // 12 minutes
  }
)

worker.on('completed', (job) => {
  console.log(`Batch ${job.data?.batchNumber} normalized successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`Batch ${job?.data?.batchNumber} failed:`, err)
})

console.log('Normalization Worker is running...')

//     const systemPrompt = `
//     You are a data-cleaning assistant. For each record:

// 1. Read the English firm name: "firmNameEnglish".
// 2. Read the original Nepali field: "firmCompanyIndustryNameNp".

// TASKS:

// - Transliterate the English firm name into Nepali, store as "translatedFirmName".
// - Compare "translatedFirmName" with the original Nepali field:
//   - If they represent the same business name (ignore minor spelling, grammar, spacing, or conjunction differences), set "isSimilar": true.
//   - If they do NOT represent the same business name, set "isSimilar": false.

// OUTPUT:

// Return a JSON array of all records in this exact format:

// [
//   {
//     "applicationCode": "",
//     "firmNameEnglish": "",
//     "translatedFirmName": "",
//     "originalFirmNepaliName": "",
//     "isSimilar": true|false
//   }
// ]

// RULES:

// - Always output all records.
// - Do not skip any records.
// - Do not include explanations or extra text.
// - Transliterate faithfully and naturally.
// - Minor differences in spelling, word order, or grammar should not set "isSimilar": false.
//     `
