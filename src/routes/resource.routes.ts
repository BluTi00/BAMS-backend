import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ResourceDto } from '../dto/resource.dto'
import {
  createResource,
  deleteResource,
  downloadFileById,
  getResources,
  getSingleResource,
  updateResource,
} from '../controllers/resource.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

const accessRoles = [
  ROLE.SUPER_ADMIN,
  ROLE.SUDO_ADMIN,
  ROLE.ADMIN,
  ROLE.DATA_ENTRY,
  ROLE.COMMITTEE_ADMIN,
]

router.route('/download/:id').get(downloadFileById)

router
  .route('/')
  .get(getResources)
  .post(
    authenticateUser,
    authorization(accessRoles),
    validateDto(ResourceDto),
    createResource
  )

router
  .route('/:id')
  .get(getSingleResource)
  .patch(
    authenticateUser,
    authorization(accessRoles),
    validateDto(ResourceDto),
    updateResource
  )
  .delete(authenticateUser, authorization(accessRoles), deleteResource)

export default router
