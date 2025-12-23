import express from 'express'
import {
  forgotPassword,
  loginUser,
  registerUser,
  resendOTP,
  resetPassword,
  verifyUserLogin,
  verifyUser,
  logoutUser,
} from '../controllers/auth.controller'
import { validateDto } from '../middleware/validationMiddleware'
import {
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  VerifyUserDto,
} from '../dto/auth.dto'
const router = express.Router()

router.route('/login').post(validateDto(LoginUserDto), loginUser)
router.route('/logout').post(logoutUser)
router.route('/register').post(validateDto(RegisterUserDto), registerUser)

router.route('/verify-user').post(validateDto(VerifyUserDto), verifyUser)
// verify login for admin
router.route('/verify-login').post(validateDto(VerifyUserDto), verifyUserLogin)
router.route('/resend-otp/:phone').get(resendOTP)

router.route('/forgot-password/:phone').get(forgotPassword)

router
  .route('/reset-password')
  .post(validateDto(ResetPasswordDto), resetPassword)

export default router
