import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { StatusHistoryDto } from '../dto/statusHistory.dto'
import {
  createStatusHistory,
  deleteStatusHistory,
  getStatusHistories,
  getSingleStatusHistory,
  updateStatusHistory,
} from '../controllers/statusHistory.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN, ROLE.USER])
)
router
  .route('/')
  .get(getStatusHistories)
  .post(validateDto(StatusHistoryDto), createStatusHistory)

router
  .route('/:id')
  .get(getSingleStatusHistory)
  .patch(validateDto(StatusHistoryDto), updateStatusHistory)
  .delete(deleteStatusHistory)

export default router
