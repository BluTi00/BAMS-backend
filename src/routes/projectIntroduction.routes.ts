import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ProjectIntroductionDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteProjectIntroduction,
  getSingleProjectIntroduction,
  updateProjectIntroduction,
} from '../controllers/projectIntroduction.controller'
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
  .get(getSingleProjectIntroduction)
  .patch(
    validateDto(ProjectIntroductionDto),
    validateApplicationCycle,
    updateProjectIntroduction
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
    deleteProjectIntroduction
  )

export default router
