import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { LoanRecipientDto } from '../dto/loanRecipient.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class LoanRecipientService {
  async create(data: LoanRecipientDto): Promise<string> {
    const {
      applicationCode,
      projectName,
      projectAddress,
      entrepreneurName,
      loanRecommendedAmount,
      loanReceivedAmount,
      panNumber,
      registrationNumber,
      applicationCycleId,
    } = data

    // check for existing loan recipient with the same application code
    const existingLoanRecipient = await db.loanRecipient.findFirst({
      where: {
        applicationCode,
        applicationCycleId,
      },
    })

    if (existingLoanRecipient) {
      throw new BadRequestError(
        'LoanRecipient with the same application code already exists in this application cycle.'
      )
    }

    await db.loanRecipient.create({
      data: {
        applicationCode,
        projectName,
        projectAddress,
        entrepreneurName,
        loanRecommendedAmount,
        loanReceivedAmount,
        panNumber,
        registrationNumber,
        applicationCycleId,
      },
    })
    return messages.created('LoanRecipient')
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.LoanRecipientWhereInput = search
      ? {
          OR: [
            {
              applicationCode: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              projectName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    // Get the count of records matching the search criteria
    const totalCount = await db.loanRecipient.count({
      where: searchCondition,
    })

    const loanRecipients = await db.loanRecipient.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        applicationCycle: true,
      },
    })

    return {
      totalCount,
      loanRecipients,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('LoanRecipient ID is required.')
    }

    const loanRecipient = await db.loanRecipient.findUnique({
      where: {
        id: id,
      },
    })

    if (!loanRecipient) {
      throw new BadRequestError('LoanRecipient not found.')
    }

    return loanRecipient
  }

  async update({
    data,
    id,
  }: {
    data: LoanRecipientDto
    id: string
  }): Promise<string> {
    const {
      applicationCode,
      projectName,
      projectAddress,
      entrepreneurName,
      loanRecommendedAmount,
      loanReceivedAmount,
      panNumber,
      registrationNumber,
      applicationCycleId,
    } = data

    if (!id) {
      throw new BadRequestError('LoanRecipient ID is required.')
    }

    const loanRecipient = await db.loanRecipient.findUnique({
      where: {
        id,
      },
    })

    if (!loanRecipient) {
      throw new BadRequestError('LoanRecipient not found.')
    }

    // check for existing loan recipient with the same application code
    const existingLoanRecipient = await db.loanRecipient.findFirst({
      where: {
        applicationCode,
        applicationCycleId,
        NOT: {
          id: id,
        },
      },
    })

    if (existingLoanRecipient) {
      throw new BadRequestError(
        'Another LoanRecipient with the same application code already exists in this application cycle.'
      )
    }

    await db.loanRecipient.update({
      where: {
        id,
      },
      data: {
        applicationCode,
        projectName,
        projectAddress,
        entrepreneurName,
        loanRecommendedAmount,
        loanReceivedAmount,
        panNumber,
        registrationNumber,
        applicationCycleId,
      },
    })

    return messages.updated('LoanRecipient')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('LoanRecipient ID is required.')
    }

    const loanRecipient = await db.loanRecipient.findUnique({
      where: {
        id,
      },
    })

    if (!loanRecipient) {
      throw new BadRequestError('LoanRecipient not found.')
    }

    await db.loanRecipient.delete({
      where: {
        id,
      },
    })

    return messages.deleted('LoanRecipient')
  }
}

export default LoanRecipientService
