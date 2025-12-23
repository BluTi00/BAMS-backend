import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { FinancialAnalysisDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteFinancialAnalysis,
  getSingleFinancialAnalysis,
  updateFinancialAnalysis,
} from '../controllers/financialAnalysis.controller'
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
  .get(getSingleFinancialAnalysis)
  .patch(
    validateDto(FinancialAnalysisDto),
    validateApplicationCycle,
    updateFinancialAnalysis
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
    deleteFinancialAnalysis
  )

export default router
