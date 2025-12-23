import express from 'express'
import {
  deleteBulkOperationLog,
  getBulkOperationLogs,
  getSingleBulkOperationLog,
  reverseBulkOperation,
} from '../controllers/bulkOperationLog.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)
router.route('/').get(getBulkOperationLogs)

router.route('/reverse/:id').patch(reverseBulkOperation)

router
  .route('/:id')
  .get(getSingleBulkOperationLog)
  .delete(deleteBulkOperationLog)

export default router
