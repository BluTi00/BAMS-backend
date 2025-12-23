import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { buildOrderBy } from '../utils/validateSorting'
import { BSToAD } from '../utils/dateFunction'

class AuditLogService {
  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.AuditLogWhereInput = search
      ? {
          OR: [
            {
              model: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              action: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }
      : {}

    const { startDate, endDate } = filters

    if (startDate || endDate) {
      searchCondition.createdAt = {
        gte: startDate ? BSToAD(startDate, true) : undefined,
        lte: endDate ? BSToAD(endDate, true) : undefined,
      }
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.auditLog.count({
      where: searchCondition,
    })

    const auditLogs = await db.auditLog.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameNp: true,
            email: true,
          },
        },
      },
    })

    return {
      totalCount,
      auditLogs,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('AuditLog ID is required.')
    }

    const auditLog = await db.auditLog.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nameNp: true,
            email: true,
          },
        },
      },
    })

    if (!auditLog) {
      throw new BadRequestError('AuditLog not found.')
    }

    return auditLog
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Activity Log ID is required.')
    }

    const auditLog = await db.auditLog.findUnique({
      where: {
        id,
      },
    })

    if (!auditLog) {
      throw new BadRequestError('Activity Log not found.')
    }

    await db.auditLog.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Activity Log')
  }
}

export default AuditLogService
