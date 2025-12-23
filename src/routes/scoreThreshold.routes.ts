import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ScoreThresholdDto } from '../dto/scoreThreshold.dto'
import {
  createScoreThreshold,
  deleteScoreThreshold,
  getScoreThresholds,
  getSingleScoreThreshold,
  updateScoreThreshold,
} from '../controllers/scoreThreshold.controller'
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
  .get(getScoreThresholds)
  .post(validateDto(ScoreThresholdDto), createScoreThreshold)

router
  .route('/:id')
  .get(getSingleScoreThreshold)
  .patch(validateDto(ScoreThresholdDto), updateScoreThreshold)
  .delete(deleteScoreThreshold)

export default router
