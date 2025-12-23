import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { LoanRecipientBulkUploadDto } from '../dto/bulkOperation.dto'
import { bulkUploadLoanRecipients } from '../controllers/loanRecipientBulkOp.controller'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)

router
  .route('/upload')
  .post(validateDto(LoanRecipientBulkUploadDto), bulkUploadLoanRecipients)

export default router
