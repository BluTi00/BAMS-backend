import { Prisma, SMS_STATUS } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { SMSDto } from '../dto/sms.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { sendSMS } from '../utils/sendSMS'
import { BSToAD } from '../utils/dateFunction'

class SMSService {
  async create(data: SMSDto): Promise<string> {
    const { messageText, phone, messageType } = data

    // for testing purpose
    // console.log('messageText:', messageText)
    // return messages.created('SMS')

    // send sms
    const res = await sendSMS(phone, messageText)
    const resJson = JSON.parse(res)

    let SMSStatus: SMS_STATUS

    if (resJson?.response_code === 1005) {
      SMSStatus = SMS_STATUS.FAILED
    } else {
      SMSStatus = SMS_STATUS.SENT
    }

    await db.sMS.create({
      data: {
        phone,
        messageText,
        messageType,
        smsStatus: SMSStatus,
      },
    })

    if (SMSStatus === SMS_STATUS.FAILED) {
      throw new BadRequestError('Failed to send SMS.')
    }

    return messages.created('SMS')
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.SMSWhereInput = search
      ? {
          OR: [
            {
              messageText: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    const { messageType, startDate, endDate } = filters

    if (messageType) {
      searchCondition.messageType = messageType
    }

    if (startDate || endDate) {
      searchCondition.createdAt = {
        gte: startDate ? BSToAD(startDate, true) : undefined,
        lte: endDate ? BSToAD(endDate, true) : undefined,
      }
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.sMS.count({
      where: searchCondition,
    })

    const sMSs = await db.sMS.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      sMSs,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('SMS ID is required.')
    }

    const sMS = await db.sMS.findUnique({
      where: {
        id: id,
      },
    })

    if (!sMS) {
      throw new BadRequestError('SMS not found.')
    }

    return sMS
  }

  async resend(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('SMS ID is required.')
    }

    const sMS = await db.sMS.findUnique({
      where: {
        id,
      },
    })

    if (!sMS) {
      throw new BadRequestError('SMS not found.')
    }

    if (sMS.smsStatus === SMS_STATUS.SENT) {
      throw new BadRequestError('SMS already sent.')
    }

    // send sms
    const res = await sendSMS(sMS.phone, sMS.messageText)
    const resJson = JSON.parse(res)

    let SMSStatus: SMS_STATUS

    if (resJson?.response_code === 1005) {
      SMSStatus = SMS_STATUS.FAILED
    } else {
      SMSStatus = SMS_STATUS.SENT
    }

    await db.sMS.update({
      where: {
        id,
      },
      data: {
        smsStatus: SMSStatus,
      },
    })

    if (SMSStatus === SMS_STATUS.FAILED) {
      throw new BadRequestError('Failed to send SMS.')
    }

    return 'SMS Resent successfully.'
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('SMS ID is required.')
    }

    const sMS = await db.sMS.findUnique({
      where: {
        id,
      },
    })

    if (!sMS) {
      throw new BadRequestError('SMS not found.')
    }

    await db.sMS.delete({
      where: {
        id,
      },
    })

    return messages.deleted('SMS')
  }
}

export default SMSService
