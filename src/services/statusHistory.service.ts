import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { StatusHistoryDto } from '../dto/statusHistory.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { buildOrderBy } from '../utils/validateSorting'

class StatusHistoryService {
  async create(data: StatusHistoryDto): Promise<any> {
    const { userId, oldStatus, newStatus, remark, applicationId } = data

    await db.statusHistory.create({
      data: {
        userId,
        oldStatus,
        newStatus,
        remark,
        applicationId,
      },
    })

    return messages.created('StatusHistory')
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters?: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.StatusHistoryWhereInput = search ? {} : {}

    const { applicationId } = filters || {}

    if (applicationId) {
      searchCondition.applicationId = applicationId
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.statusHistory.count({
      where: searchCondition,
    })

    const statusHistories = await db.statusHistory.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      statusHistories,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('StatusHistory ID is required.')
    }

    const statusHistory = await db.statusHistory.findUnique({
      where: {
        id: id,
      },
    })

    if (!statusHistory) {
      throw new BadRequestError('StatusHistory not found.')
    }

    return statusHistory
  }

  async update({
    data,
    id,
  }: {
    data: StatusHistoryDto
    id: string
  }): Promise<string> {
    const { userId, oldStatus, newStatus, remark, applicationId } = data

    if (!id) {
      throw new BadRequestError('StatusHistory ID is required.')
    }

    const statusHistory = await db.statusHistory.findUnique({
      where: {
        id,
      },
    })

    if (!statusHistory) {
      throw new BadRequestError('StatusHistory not found.')
    }

    await db.statusHistory.update({
      where: {
        id,
      },
      data: {
        userId,
        oldStatus,
        newStatus,
        remark,
        applicationId,
      },
    })

    return messages.updated('StatusHistory')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('StatusHistory ID is required.')
    }

    const statusHistory = await db.statusHistory.findUnique({
      where: {
        id,
      },
    })

    if (!statusHistory) {
      throw new BadRequestError('StatusHistory not found.')
    }

    await db.statusHistory.delete({
      where: {
        id,
      },
    })

    return messages.deleted('StatusHistory')
  }
}

export default StatusHistoryService
