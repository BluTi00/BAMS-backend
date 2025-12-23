import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import {
  ApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/application.dto'
import {
  createApplication,
  deleteApplication,
  getUserApplicationId,
  getApplications,
  getSingleApplication,
  updateApplicationStatus,
  updateApplication,
  uploadDocument,
  registerApplication,
  getCanEditApplication,
  exportApplications,
  getApplicationsForAssessment,
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
router.route('/for-assessment').get(getApplicationsForAssessment)
router.route('/applicationId').get(getUserApplicationId)
router.route('/upload-document/:id').patch(uploadDocument)
router.route('/can-edit/:id').get(getCanEditApplication)
router.route('/register/:id').patch(registerApplication)
router.route('/export').post(exportApplications)

router
  .route('/status/:id')
  .patch(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN]),
    validateDto(UpdateApplicationStatusDto),
    updateApplicationStatus
  ) //  no in use currently

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
