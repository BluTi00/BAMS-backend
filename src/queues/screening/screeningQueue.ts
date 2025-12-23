import { Queue } from 'bullmq'
import { redisConnection } from '../redisConnection'

export const screeningQueue = new Queue('screeningQueue', {
  connection: redisConnection,
})
