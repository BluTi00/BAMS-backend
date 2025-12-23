import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { SwotAnalysisDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteSwotAnalysis,
  getSingleSwotAnalysis,
  updateSwotAnalysis,
} from '../controllers/swotAnalysis.controller'
import validateApplicationCycle from '../middleware/validateApplicationCycle'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.USER,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
  ])
)

router
  .route('/:id')
  .get(getSingleSwotAnalysis)
  .patch(
    validateDto(SwotAnalysisDto),
    validateApplicationCycle,
    updateSwotAnalysis
  )
  .delete(
    authorization([
      ROLE.SUPER_ADMIN,
      ROLE.SUDO_ADMIN,
      ROLE.ADMIN,
      ROLE.USER,
      ROLE.DATA_ENTRY,
      ROLE.COMMITTEE_ADMIN,
    ]),
    validateApplicationCycle,
    deleteSwotAnalysis
  )

export default router
