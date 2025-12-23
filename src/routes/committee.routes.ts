import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { CommitteeDto } from '../dto/committee.dto'
import {
  createCommittee,
  deleteCommittee,
  getCommitteeList,
  getCommittees,
  getSingleCommittee,
  updateCommittee,
} from '../controllers/committee.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getCommitteeList)

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)
router
  .route('/')
  .get(getCommittees)
  .post(validateDto(CommitteeDto), createCommittee)

router
  .route('/:id')
  .get(getSingleCommittee)
  .patch(validateDto(CommitteeDto), updateCommittee)
  .delete(deleteCommittee)

export default router
