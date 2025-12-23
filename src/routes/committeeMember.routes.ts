import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { CommitteeMemberDto } from '../dto/committeeMember.dto'
import {
  createCommitteeMember,
  deleteCommitteeMember,
  getCommitteeMembers,
  getSingleCommitteeMember,
  updateCommitteeMember,
} from '../controllers/committeeMember.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)
router
  .route('/')
  .get(getCommitteeMembers)
  .post(validateDto(CommitteeMemberDto), createCommitteeMember)

router
  .route('/:id')
  .get(getSingleCommitteeMember)
  .patch(validateDto(CommitteeMemberDto), updateCommitteeMember)
  .delete(deleteCommitteeMember)

export default router
