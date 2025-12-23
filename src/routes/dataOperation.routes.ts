import express from 'express'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { exportApplications } from '../controllers/dataOperation.controller'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([
    ROLE.SUDO_ADMIN,
    ROLE.SUPER_ADMIN,
    ROLE.ADMIN,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
  ])
)

router.route('/application-export').get(exportApplications)

export default router
