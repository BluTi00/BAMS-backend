import express from 'express'
import {
  deleteAuditLog,
  getAuditLogs,
  getSingleAuditLog,
} from '../controllers/auditLog.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)
router.route('/').get(getAuditLogs)
router
  .route('/:id')
  .get(getSingleAuditLog)
  .delete(authorization([ROLE.SUDO_ADMIN]), deleteAuditLog)

export default router
