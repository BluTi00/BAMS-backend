import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { AssessmentDto, UpdateAssessmentDto } from '../dto/assessment.dto'
import {
  createAssessment,
  createAssessmentDraft,
  deleteAssessment,
  forwardAssessment,
  getAssessment,
  getAssessments,
  getSingleAssessment,
  updateAssessment,
} from '../controllers/assessment.controller'
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
router
  .route('/')
  .get(getAssessments)
  .post(validateDto(AssessmentDto), createAssessment)

router.route('/draft').post(validateDto(AssessmentDto), createAssessmentDraft)

router.route('/one').get(getAssessment)

router.route('/forward/:id').patch(forwardAssessment)

router
  .route('/:id')
  .get(getSingleAssessment)
  .patch(validateDto(UpdateAssessmentDto), updateAssessment)
  .delete(deleteAssessment)

export default router
