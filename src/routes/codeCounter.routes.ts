import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { CodeCounterDto } from '../dto/codeCounter.dto'
import {
  createCodeCounter,
  deleteCodeCounter,
  getCodeCounterList,
  getCodeCounters,
  getSingleCodeCounter,
  updateCodeCounter,
} from '../controllers/codeCounter.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getCodeCounterList)

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
    ROLE.USER,
  ])
)
router
  .route('/')
  .get(getCodeCounters)
  .post(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]),
    validateDto(CodeCounterDto),
    createCodeCounter
  )

router
  .route('/:id')
  .get(getSingleCodeCounter)
  .patch(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]),
    validateDto(CodeCounterDto),
    updateCodeCounter
  )
  .delete(authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]), deleteCodeCounter)

export default router
