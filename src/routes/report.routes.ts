import express from 'express'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { getReport } from '../controllers/report.controller'
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
router.route('/').get(getReport)

export default router
