import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { RiskImpactAnalysisDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteRiskImpactAnalysis,
  getSingleRiskImpactAnalysis,
  updateRiskImpactAnalysis,
} from '../controllers/riskImpactAnalysis.controller'
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
  .get(getSingleRiskImpactAnalysis)
  .patch(
    validateDto(RiskImpactAnalysisDto),
    validateApplicationCycle,
    updateRiskImpactAnalysis
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
    deleteRiskImpactAnalysis
  )

export default router
