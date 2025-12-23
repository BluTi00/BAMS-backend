import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { LoanRecipientDto } from '../dto/loanRecipient.dto'
import {
  createLoanRecipient,
  deleteLoanRecipient,
  getLoanRecipients,
  getSingleLoanRecipient,
  updateLoanRecipient,
} from '../controllers/loanRecipient.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)
router
  .route('/')
  .get(getLoanRecipients)
  .post(validateDto(LoanRecipientDto), createLoanRecipient)

router
  .route('/:id')
  .get(getSingleLoanRecipient)
  .patch(validateDto(LoanRecipientDto), updateLoanRecipient)
  .delete(deleteLoanRecipient)

export default router
