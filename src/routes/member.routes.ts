import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { MemberDto } from '../dto/member.dto'
import {
  createMember,
  deleteMember,
  getMemberList,
  getMembers,
  getSingleMember,
  updateMember,
} from '../controllers/member.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getMemberList)

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.COMMITTEE_ADMIN,
  ])
)
router.route('/').get(getMembers).post(validateDto(MemberDto), createMember)

router
  .route('/:id')
  .get(getSingleMember)
  .patch(validateDto(MemberDto), updateMember)
  .delete(deleteMember)

export default router
