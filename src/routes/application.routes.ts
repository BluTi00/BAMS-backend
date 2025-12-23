import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import {
  ApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/application.dto'
import {
  createApplication,
  deleteApplication,
  getApplications,
  getSingleApplication,
  updateApplicationStatus,
  updateApplication,
  exportApplications,
  getApplication,
} from '../controllers/application.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import validateApplicationCycle from '../middleware/validateApplicationCycle'

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
router
  .route('/')
  .get(getApplications)
  .post(
    validateDto(ApplicationDto),
    validateApplicationCycle,
    createApplication
  )

router.route('/export').post(exportApplications)

router
  .route('/status/:id')
  .patch(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN]),
    validateDto(UpdateApplicationStatusDto),
    updateApplicationStatus
  ) //  no in use currently

router.route('/one').get(getApplication)

router
  .route('/:id')
  .get(getSingleApplication)
  .delete(authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]), deleteApplication)
  .patch(
    validateDto(ApplicationDto),
    validateApplicationCycle,
    updateApplication
  )

export default router
