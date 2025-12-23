import 'dotenv/config'
import { Worker } from 'bullmq'
import { redisConnection } from '../redisConnection'
import { ASSESSMENT_TYPE } from '../../generated/client/client'
import { getScreeningScore } from './screeningScorer'
import { db } from '../../db/db.server'

const worker = new Worker(
  'screeningQueue',
  async (job) => {
    // call screening logic (rule-based + AI)
    const applicationId = job.data.applicationId
    if (!applicationId) {
      return
    }

    // ---------- RULE BASED EVALUATION ----------
    // Step 2: Get screening score
    const result = await getScreeningScore(applicationId)

    if (!result) {
      return
    }

    // 3. Save screening to DB
    await db.assessment.create({
      data: {
        applicationId: applicationId,
        assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
        score: result?.score || 0,
        scoreSheet: (result?.scoreSheet as any) || null,
        rejectionReason: result?.rejectionReason || null,
      },
    })

    return
  },
  { connection: redisConnection }
)

worker.on('completed', (job) => {
  console.log(`Application ${job.data.applicationId} screened successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`Application ${job?.data?.applicationId} failed:`, err)
})

console.log('Screening Worker is running...')
