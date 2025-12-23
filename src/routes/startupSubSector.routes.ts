import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { StartupSubSectorDto } from '../dto/startupSubSector.dto'
import {
  createStartupSubSector,
  deleteStartupSubSector,
  getStartupSubSectorList,
  getStartupSubSectors,
  getSingleStartupSubSector,
  updateStartupSubSector,
} from '../controllers/startupSubSector.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getStartupSubSectorList)

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
  .get(getStartupSubSectors)
  .post(validateDto(StartupSubSectorDto), createStartupSubSector)

router
  .route('/:id')
  .get(getSingleStartupSubSector)
  .patch(validateDto(StartupSubSectorDto), updateStartupSubSector)
  .delete(deleteStartupSubSector)

export default router
