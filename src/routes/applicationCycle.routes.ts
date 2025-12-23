import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ApplicationCycleDto } from '../dto/applicationCycle.dto'
import {
  createApplicationCycle,
  deleteApplicationCycle,
  getLatestApplicationCycle,
  getApplicationCycleList,
  getApplicationCycles,
  getSingleApplicationCycle,
  updateApplicationCycle,
} from '../controllers/applicationCycle.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getApplicationCycleList)
router.route('/latest').get(getLatestApplicationCycle)

router.use(
  authenticateUser,
  authorization([
    ROLE.SUPER_ADMIN,
    ROLE.SUDO_ADMIN,
    ROLE.ADMIN,
    ROLE.DATA_ENTRY,
    ROLE.COMMITTEE_ADMIN,
    ROLE.USER,
  ])
)
router
  .route('/')
  .get(getApplicationCycles)
  .post(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]),
    validateDto(ApplicationCycleDto),
    createApplicationCycle
  )

router
  .route('/:id')
  .get(getSingleApplicationCycle)
  .patch(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]),
    validateDto(ApplicationCycleDto),
    updateApplicationCycle
  )
  .delete(
    authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]),
    deleteApplicationCycle
  )

export default router
