import express from 'express'
import {
  getApplicationHistories,
  getSingleApplicationHistory,
} from '../controllers/applicationHistory.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'

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

router.route('/').get(getApplicationHistories)
router.route('/:id').get(getSingleApplicationHistory)

export default router
