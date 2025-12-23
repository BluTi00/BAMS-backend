import express from 'express'
import {
  clearScreeningQueue,
  screenSingleApplication,
  getScreeningSummary,
  pauseScreeningProcess,
  resumeScreeningProcess,
  startScreeningProcess,
} from '../controllers/screening.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.COMMITTEE_ADMIN,
  ])
)

router.route('/start').post(startScreeningProcess)
router.route('/summary').get(getScreeningSummary)
router.route('/pause').patch(pauseScreeningProcess)
router.route('/resume').patch(resumeScreeningProcess)
router.route('/queue').delete(clearScreeningQueue)
router.route('/:id/screen').post(screenSingleApplication)

export default router
