import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { EntrepreneurshipActivityDto } from '../dto/entrepreneurshipActivity.dto'
import {
  createEntrepreneurshipActivity,
  deleteEntrepreneurshipActivity,
  getEntrepreneurshipActivityList,
  getEntrepreneurshipActivities,
  getSingleEntrepreneurshipActivity,
  updateEntrepreneurshipActivity,
} from '../controllers/entrepreneurshipActivity.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getEntrepreneurshipActivityList)

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
  .get(getEntrepreneurshipActivities)
  .post(
    validateDto(EntrepreneurshipActivityDto),
    createEntrepreneurshipActivity
  )

router
  .route('/:id')
  .get(getSingleEntrepreneurshipActivity)
  .patch(
    validateDto(EntrepreneurshipActivityDto),
    updateEntrepreneurshipActivity
  )
  .delete(deleteEntrepreneurshipActivity)

export default router
