import { OTP_TYPE } from '../generated/client/client'
import { db } from '../db/db.server'
import { BadRequestError } from '../errors'

const getOPT = () => {
  return `${Math.floor(1000 + Math.random() * 9000)}`
}

class OTPService {
  async createOTP(data: any): Promise<any> {
    const { name, password, phone, otpType, gender } = data
    const otp = getOPT()

    await db.oTP.deleteMany({
      where: {
        phone,
      },
    })

    await db.oTP.create({
      data: {
        otp: String(otp) || '',
        name,
        password,
        phone: phone,
        otpType: otpType || OTP_TYPE.REGISTER,
        expiryTime: new Date(Date.now() + 600000),
        gender,
      },
    })
    return otp
  }

  async verifyOTP(phone: string, candidateOtp: string): Promise<any> {
    const otp = await db.oTP.findFirst({
      where: {
        phone: phone,
        otp: candidateOtp,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!otp) {
      throw new BadRequestError('Invalid OTP.')
    }

    const isExpired = new Date() > otp?.expiryTime

    await db.oTP.delete({
      where: {
        id: otp.id,
      },
    })

    if (isExpired) {
      throw new BadRequestError('OTP has expired.')
    }

    return otp
  }

  async resendOTP(phone: string): Promise<any> {
    const isOtpExist = await db.oTP.findFirst({
      where: {
        phone,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!isOtpExist) {
      throw new BadRequestError('Invalid OTP.')
    }

    const newOtp = getOPT()

    await db.oTP.update({
      where: {
        id: isOtpExist.id,
      },
      data: {
        otp: newOtp,
        expiryTime: new Date(Date.now() + 600000),
      },
    })

    return newOtp
  }
}

export default OTPService
