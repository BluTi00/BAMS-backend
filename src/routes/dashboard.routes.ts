import express from 'express'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  getFormCheckListByApplication,
  getFormCheckListByUser,
} from '../controllers/dashboard.controller'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([
    ROLE.SUDO_ADMIN,
    ROLE.SUPER_ADMIN,
    ROLE.ADMIN,
    ROLE.USER,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
  ])
)

router.route('/form-checklist/user/:id').get(getFormCheckListByUser)
router
  .route('/form-checklist/application/:id')
  .get(getFormCheckListByApplication)

export default router
