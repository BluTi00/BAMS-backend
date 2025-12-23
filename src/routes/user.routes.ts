import express from 'express'

import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
import { validateDto } from '../middleware/validationMiddleware'
import { ChangePasswordDto, UpdateUserDto, UserDto } from '../dto/user.dto'
import {
  changePassword,
  createUser,
  deleteUser,
  getSingleUser,
  getUsers,
  updateUser,
} from '../controllers/user.controller'

const router = express.Router()

router.use(authenticateUser)

router
  .use(
    authorization([
      ROLE.SUPER_ADMIN,
      ROLE.SUDO_ADMIN,
      ROLE.ADMIN,
      ROLE.USER,
      ROLE.DATA_ENTRY,
      ROLE.COMMITTEE_ADMIN,
    ])
  )
  .route('/')
  .get(getUsers)
  .post(validateDto(UserDto), createUser)

router
  .route('/change-password')
  .patch(validateDto(ChangePasswordDto), changePassword)

router
  .route('/:id')
  .get(getSingleUser)
  .patch(validateDto(UpdateUserDto), updateUser)
  .delete(authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN]), deleteUser)

export default router
