import 'dotenv/config'
import { Queue } from 'bullmq'
import { redisConnection } from '../redisConnection'

export const normalizationQueue = new Queue('normalizationQueue', {
  connection: redisConnection,
})
