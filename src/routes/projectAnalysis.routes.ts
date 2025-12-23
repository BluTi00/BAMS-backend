import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ProjectAnalysisDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteProjectAnalysis,
  getSingleProjectAnalysis,
  updateProjectAnalysis,
} from '../controllers/projectAnalysis.controller'
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
  .get(getSingleProjectAnalysis)
  .patch(
    validateDto(ProjectAnalysisDto),
    validateApplicationCycle,
    updateProjectAnalysis
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
    deleteProjectAnalysis
  )

export default router
