import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { ProductUsageDto } from '../dto/application.dto'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import {
  deleteProductUsage,
  getSingleProductUsage,
  updateProductUsage,
} from '../controllers/productUsage.controller'
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
  .route('/:id')
  .get(getSingleProductUsage)
  .patch(
    validateDto(ProductUsageDto),
    validateApplicationCycle,
    updateProductUsage
  )
  .delete(
    authorization([
      ROLE.SUPER_ADMIN,
      ROLE.SUDO_ADMIN,
      ROLE.ADMIN,
      ROLE.USER,
      ROLE.DATA_ENTRY,
      ROLE.COMMITTEE_ADMIN,
    ]),
    validateApplicationCycle,
    deleteProductUsage
  )

export default router
