import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { StartupSectorDto } from '../dto/startupSector.dto'
import {
  createStartupSector,
  deleteStartupSector,
  getStartupSectorList,
  getStartupSectors,
  getSingleStartupSector,
  updateStartupSector,
} from '../controllers/startupSector.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getStartupSectorList)

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
  .get(getStartupSectors)
  .post(validateDto(StartupSectorDto), createStartupSector)

router
  .route('/:id')
  .get(getSingleStartupSector)
  .patch(validateDto(StartupSectorDto), updateStartupSector)
  .delete(deleteStartupSector)

export default router
