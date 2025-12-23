import { db } from '../db/db.server'
import {
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
} from '../dto/auth.dto'
import { BadRequestError } from '../errors'
import { comparePassword, hashPassword } from '../utils/helper'
import jwt from 'jsonwebtoken'
import { smsMessage } from '../constants/smsMessage'
import SMSService from './sms.service'
import { SMSMessageType } from '../constants/enum'
import OTPService from './otp.service'
import { GENDER, OTP_TYPE } from '../generated/client/client'
import { Response } from 'express'

const oTPService = new OTPService()
const smsService = new SMSService()

class AuthService {
  async registerUser(data: RegisterUserDto): Promise<any> {
    const { name, password, phone, gender } = data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { phone, isDummyAccount: false },
    })
    if (existingUser) {
      throw new BadRequestError('User with this phone already exists.')
    }

    const hashedPassword = await hashPassword(password)

    // generate OTP
    const otp = await oTPService.createOTP({
      name,
      password: hashedPassword,
      phone,
      otpType: OTP_TYPE.REGISTER,
      gender,
    })

    await smsService.create({
      messageText: smsMessage.accountVerification(otp),
      phone,
      messageType: SMSMessageType.ACCOUNT_VERIFICATION,
    })

    // console.log(otp, 'OTP')

    return 'OTP sent to your phone.'
  }

  async verifyUser(data: any): Promise<string> {
    const { phone, otp: candidateOTP } = data

    const verifiedUser = await oTPService.verifyOTP(phone, candidateOTP)
    const { name, password, gender } = verifiedUser

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { phone: phone },
    })
    if (existingUser) {
      if (existingUser.isDummyAccount) {
        // Create new user

        await db.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            name,
            password,
            isDummyAccount: false,
          },
        })

        return 'User Registered successfully.'
      } else {
        throw new BadRequestError('User with this phone already exists.')
      }
    }

    // Create new user

    await db.user.create({
      data: {
        name,
        password,
        phone,
        gender: gender ? gender : GENDER.MALE,
      },
    })

    return 'User Registered successfully.'
  }

  async loginUser(data: LoginUserDto, res: Response) {
    const { phone, password } = data

    const user = await db.user.findUnique({
      where: { phone, isDummyAccount: false },
    })

    if (!user) throw new BadRequestError('Invalid Credentials')
    if (!(await comparePassword(password, user.password)))
      throw new BadRequestError('Invalid Credentials')
    if (user.isBlocked) throw new BadRequestError('Account blocked')
    if (user.isDeactivated) throw new BadRequestError('Account deactivated')

    // --- OTP required branch ---
    if (user.requireLoginVerification) {
      const otp = await oTPService.createOTP({
        name: user.name,
        phone,
        otpType: OTP_TYPE.LOGIN_VERIFY,
      })

      await smsService.create({
        messageText: smsMessage.loginVerification(otp),
        phone,
        messageType: SMSMessageType.LOGIN_VERIFICATION,
      })

      return {
        user: { role: user.role, phone: user.phone },
        requireVerification: true,
      }
    }

    // --- OTP not required branch: issue JWT immediately ---
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_LIFETIME as any }
    )

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return {
      user: { ...user, password: undefined },
      requireVerification: false,
    }
  }

  async logoutUser(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return 'Logged out successfully.'
  }

  async resendOTP(phone: string, loginVerification: boolean): Promise<any> {
    const otp = await oTPService.resendOTP(phone)

    await smsService.create({
      messageText: loginVerification
        ? smsMessage.loginVerification(otp)
        : smsMessage.accountVerification(otp),
      phone,
      messageType: SMSMessageType.RESEND,
    })

    return 'OTP sent to your phone.'
  }

  // reset password
  async forgotPassword(phone: string): Promise<any> {
    // find user by phone
    const user = await db.user.findUnique({
      where: {
        phone,
      },
    })
    if (!user) {
      throw new BadRequestError('No user with this phone exists.')
    }

    // generate OTP
    const otp = await oTPService.createOTP({
      phone: user.phone,
      otpType: OTP_TYPE.PASSWORD_RESET,
    })

    await smsService.create({
      messageText: smsMessage.passwordReset(otp),
      phone,
      messageType: SMSMessageType.PASSWORD_RESET,
    })

    return 'Password Reset OTP sent to your phone.'
  }

  async resetPassword(data: ResetPasswordDto) {
    const { otp: candidateOTP, password, phone } = data

    await oTPService.verifyOTP(phone, candidateOTP)

    const hashedPassword = await hashPassword(password)

    await db.user.update({
      where: {
        phone: phone,
      },
      data: { password: hashedPassword },
    })

    return 'Password reset successful.'
  }

  async verifyLogin(data: { phone: string; otp: string }, res: Response) {
    const { phone, otp: candidateOTP } = data

    await oTPService.verifyOTP(phone, candidateOTP)

    const user = await db.user.findUnique({ where: { phone } })

    if (!user || !user.requireLoginVerification)
      throw new BadRequestError('Invalid Credentials')

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_LIFETIME as any }
    )

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { user: { ...user, password: undefined } }
  }
}

export default AuthService
