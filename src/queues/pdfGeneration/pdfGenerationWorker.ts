import 'dotenv/config'
import { Worker } from 'bullmq'
import { redisConnection } from '../redisConnection'
import fs from 'fs'
import ApplicationDownloadService from '../../services/applicationDownload.service'

const applicationDownload = new ApplicationDownloadService()

const worker = new Worker(
  'pdfGenerationQueue',
  async (job) => {
    const applicationId = job.data.applicationId

    const { pdf } = await applicationDownload.getPdfById({
      id: applicationId,
      isUserRole: false,
      includeAttachment: true,
      enablePuppeteerCluster: true,
    })

    // save pdf to file for testing
    fs.writeFileSync(
      `./extra/applications-pdf/${job?.data?.applicationCode}.pdf`,
      pdf
    )
    return
  },
  {
    connection: redisConnection,
    concurrency: 3,
    // Time BullMQ considers a job “active” before thinking it stalled
    lockDuration: 1000 * 60 * 12, // 12 minutes
  }
)

worker.on('completed', (job) => {
  console.log(`${job.data?.applicationCode}: pdf generated successfully.`)
})

worker.on('failed', (job, err) => {
  console.error(`Pdf of Application ${job?.data?.applicationCode} failed:`, err)
})

console.log('Pdf Generation Worker is running...')
