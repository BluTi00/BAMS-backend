import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { TokenData } from '../server'
import { compareResource } from '../utils/helper'
import { includeAddress } from '../constants/constant'

class ApplicationHistoryService {
  async getAll({
    paginationData: { page, perPage, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.ApplicationWhereInput = {}
    searchCondition.deletedAt = null

    const { userId } = filters

    if (!userId) {
      return { totalCount: 0, applicationHistories: [] }
    }

    if (userId) {
      searchCondition.userId = userId
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.application.count({
      where: searchCondition,
    })

    const applicationHistories = await db.application.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        address: includeAddress,
        applicationCycle: {
          select: {
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    return {
      totalCount,
      applicationHistories,
    }
  }

  async getById(id: string, user: TokenData): Promise<any> {
    if (!id) {
      throw new BadRequestError('ApplicationHistory ID is required.')
    }
    const applicationHistory = await db.application.findUnique({
      where: {
        id: id,
      },
    })

    compareResource({
      resource: applicationHistory?.userId || null,
      user: user,
    })

    if (!applicationHistory) {
      throw new BadRequestError('ApplicationHistory not found.')
    }

    return applicationHistory
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('ApplicationHistory ID is required.')
    }

    const applicationHistory = await db.application.findUnique({
      where: {
        id,
      },
    })

    if (!applicationHistory) {
      throw new BadRequestError('ApplicationHistory not found.')
    }

    await db.application.delete({
      where: {
        id,
      },
    })

    return messages.deleted('ApplicationHistory')
  }
}

export default ApplicationHistoryService
