import 'dotenv/config'
import { Queue } from 'bullmq'
import { redisConnection } from '../redisConnection'

export const pdfGenerationQueue = new Queue('pdfGenerationQueue', {
  connection: redisConnection,
})
