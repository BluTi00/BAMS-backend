import { BULK_OPERATION_TYPE, Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { withSkipAudit } from '../middleware/context'
import { buildOrderBy } from '../utils/validateSorting'

interface IBulkOperationLog {
  operationType: BULK_OPERATION_TYPE
  totalCount: number
  duration: number
  triggeredById: string
}

class BulkOperationLogService {
  async create(data: IBulkOperationLog): Promise<any> {
    const { operationType } = data

    const newBulkOperation = await db.bulkOperationLog.create({
      data: {
        operationType: operationType,
      },
    })

    return newBulkOperation?.id
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.BulkOperationLogWhereInput = search ? {} : {}

    const { operationType } = filters

    if (operationType) {
      searchCondition.operationType = operationType
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.bulkOperationLog.count({
      where: searchCondition,
    })

    const bulkOperationLogs = await db.bulkOperationLog.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        triggeredBy: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            bulkOperationRowErrors: true,
          },
        },
      },
    })

    return {
      totalCount,
      bulkOperationLogs,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('BulkOperationLog ID is required.')
    }

    const bulkOperationLog = await db.bulkOperationLog.findUnique({
      where: {
        id: id,
      },
      include: {
        triggeredBy: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            bulkOperationRowErrors: true,
          },
        },
      },
    })

    if (!bulkOperationLog) {
      throw new BadRequestError('BulkOperationLog not found.')
    }

    return bulkOperationLog
  }

  async update({
    data,
    id,
  }: {
    data: IBulkOperationLog
    id: string
  }): Promise<string> {
    const { totalCount, duration, triggeredById } = data

    if (!id) {
      throw new BadRequestError('BulkOperationLog ID is required.')
    }

    const bulkOperationLog = await db.bulkOperationLog.findUnique({
      where: {
        id,
      },
    })

    if (!bulkOperationLog) {
      throw new BadRequestError('BulkOperationLog not found.')
    }

    await db.bulkOperationLog.update({
      where: {
        id,
      },
      data: {
        totalCount,
        duration,
        triggeredById,
      },
    })

    return messages.updated('BulkOperationLog')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('BulkOperationLog ID is required.')
    }

    const bulkOperationLog = await db.bulkOperationLog.findUnique({
      where: {
        id,
      },
    })

    if (!bulkOperationLog) {
      throw new BadRequestError('BulkOperationLog not found.')
    }

    await db.bulkOperationLog.delete({
      where: {
        id,
      },
    })

    return messages.deleted('BulkOperationLog')
  }

  async reverse(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('BulkOperationLog ID is required.')
    }

    const bulkOperationLog = await db.bulkOperationLog.findUnique({
      where: {
        id,
      },
    })

    if (!bulkOperationLog) {
      throw new BadRequestError('BulkOperationLog not found.')
    }

    if (bulkOperationLog.isReversed) {
      throw new BadRequestError(
        'This bulk operation has already been reversed.'
      )
    }

    // Reverse with skip audit trail
    withSkipAudit(async () => {
      if (
        bulkOperationLog.operationType ===
        BULK_OPERATION_TYPE.APPLICATION_UPLOAD
      ) {
        await db.application.deleteMany({
          where: {
            bulkOperationLogId: id,
          },
        })
      }
    })

    await db.bulkOperationLog.update({
      where: {
        id,
      },
      data: {
        isReversed: true,
      },
    })

    return 'Bulk operation reversed successfully.'
  }
}

export default BulkOperationLogService
