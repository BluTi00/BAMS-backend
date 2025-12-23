import { Request, Response } from 'express'
import AuthService from '../services/auth.service'
import { StatusCodes } from 'http-status-codes'
import { checkBooleanParam } from '../utils/helper'

const authService = new AuthService()

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const message = await authService.registerUser(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const verifyUser = async (req: Request, res: Response): Promise<void> => {
  const message = await authService.verifyUser(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.loginUser(req.body, res)

  res.status(StatusCodes.OK).json({
    data: result,
    msg: result.requireVerification
      ? 'OTP sent. Please verify to complete login.'
      : 'Login successful.',
  })
}

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const message = await authService.logoutUser(res)
  res.status(StatusCodes.OK).json({ msg: message })
}

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const message = await authService.forgotPassword(req.params.phone)
  res.status(StatusCodes.OK).json({ msg: message })
}

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const message = await authService.resetPassword(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const message = await authService.resendOTP(
    req.params.phone as string,
    checkBooleanParam(req.query.loginVerification) || false
  )
  res.status(StatusCodes.OK).json({ msg: message })
}

const verifyUserLogin = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.verifyLogin(req.body, res)

  // JWT cookie is set inside verifyLogin service
  res.status(StatusCodes.OK).json({
    data: { user },
    msg: 'Login successful.',
  })
}

export {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyUser,
  resendOTP,
  verifyUserLogin,
}
