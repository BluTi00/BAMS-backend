import express from 'express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { screeningQueue } from '../queues/screening/screeningQueue'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { normalizationQueue } from '../queues/applicationNormalization/normalizationQueue'
import { pdfGenerationQueue } from '../queues/pdfGeneration/pdfGenerationQueue'

export function setupBullBoard(app: any) {
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  createBullBoard({
    queues: [
      new BullMQAdapter(screeningQueue),
      new BullMQAdapter(normalizationQueue),
      new BullMQAdapter(pdfGenerationQueue),
    ],
    serverAdapter,
  })

  // Protect BullBoard
  const protectedRouter = express.Router()

  protectedRouter.use(
    authenticateUser,
    authorization([ROLE.SUDO_ADMIN, ROLE.SUPER_ADMIN])
  )

  // mount the bullboard router inside this protected router
  protectedRouter.use(serverAdapter.getRouter())

  // now mount the protected router on the app
  app.use('/admin/queues', protectedRouter)
}
