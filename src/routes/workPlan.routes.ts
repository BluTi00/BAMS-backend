import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { WorkPlanDto } from '../dto/workPlan.dto'
import {
  createWorkPlan,
  deleteWorkPlan,
  getWorkPlans,
  getSingleWorkPlan,
  updateWorkPlan,
} from '../controllers/workPlan.controller'
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
  .get(getWorkPlans)
  .post(validateDto(WorkPlanDto), validateApplicationCycle, createWorkPlan)

router
  .route('/:id')
  .get(getSingleWorkPlan)
  .patch(validateDto(WorkPlanDto), validateApplicationCycle, updateWorkPlan)
  .delete(validateApplicationCycle, deleteWorkPlan)

export default router
