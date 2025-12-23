import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { SMSDto } from '../dto/sms.dto'
import {
  createSMS,
  deleteSMS,
  getSMSs,
  getSingleSMS,
  resendSMS,
} from '../controllers/sms.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
  ])
)
router.route('/').get(getSMSs).post(validateDto(SMSDto), createSMS)

router.route('/:id').get(getSingleSMS).patch(resendSMS).delete(deleteSMS)

export default router
