import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ProposerDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteProposer,
  getSingleProposer,
  updateProposer,
} from '../controllers/proposer.controller'
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
  .get(getSingleProposer)
  .patch(validateDto(ProposerDto), validateApplicationCycle, updateProposer)
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
    deleteProposer
  )

export default router
