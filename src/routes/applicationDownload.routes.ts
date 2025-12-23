import express from 'express'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { getSingleApplicationPdf } from '../controllers/applicationDownload.controller'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.USER,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
  ])
)

router.route('/:id').get(getSingleApplicationPdf)

export default router
