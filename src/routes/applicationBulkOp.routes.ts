import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { ApplicationBulkUploadDto } from '../dto/bulkOperation.dto'
import { bulkUploadApplications } from '../controllers/applicationBulkOp.controller'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)

router
  .route('/upload')
  .post(validateDto(ApplicationBulkUploadDto), bulkUploadApplications)

export default router
