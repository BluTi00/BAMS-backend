import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { EntrepreneurProfileDto } from '../dto/entrepreneurProfile.dto'
import {
  createEntrepreneurProfile,
  deleteEntrepreneurProfile,
  getEntrepreneurProfiles,
  getSingleEntrepreneurProfile,
  updateEntrepreneurProfile,
} from '../controllers/entrepreneurProfile.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
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
  .route('/')
  .get(getEntrepreneurProfiles)
  .post(
    validateDto(EntrepreneurProfileDto),
    validateApplicationCycle,
    createEntrepreneurProfile
  )

router
  .route('/:id')
  .get(getSingleEntrepreneurProfile)
  .patch(
    validateDto(EntrepreneurProfileDto),
    validateApplicationCycle,
    updateEntrepreneurProfile
  )
  .delete(validateApplicationCycle, deleteEntrepreneurProfile)

export default router
