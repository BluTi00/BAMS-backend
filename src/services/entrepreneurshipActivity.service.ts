import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { EntrepreneurshipActivityDto } from '../dto/entrepreneurshipActivity.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class EntrepreneurshipActivityService {
  async create(data: EntrepreneurshipActivityDto): Promise<string> {
    const { name, nameNp, code } = data

    // Check for existing EntrepreneurshipActivity with the same code
    const existingSector = await db.entrepreneurshipActivity.findFirst({
      where: {
        code: code,
      },
    })

    if (existingSector) {
      throw new BadRequestError(
        `EntrepreneurshipActivity with code '${code}' already exists.`
      )
    }

    await db.entrepreneurshipActivity.create({
      data: {
        name,
        nameNp,
        code,
      },
    })
    return messages.created('EntrepreneurshipActivity')
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.EntrepreneurshipActivityWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              nameNp: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    // Get the count of records matching the search criteria
    const totalCount = await db.entrepreneurshipActivity.count({
      where: searchCondition,
    })

    const entrepreneurshipActivities =
      await db.entrepreneurshipActivity.findMany({
        where: searchCondition,
        orderBy: {
          [sortId || 'createdAt']: desc ? 'asc' : 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      })

    return {
      totalCount,
      entrepreneurshipActivities,
    }
  }

  async getList(): Promise<any> {
    const entrepreneurshipActivities =
      await db.entrepreneurshipActivity.findMany()

    const formattedEntrepreneurshipActivities = entrepreneurshipActivities.map(
      (sector) => ({
        label: {
          en: sector.name,
          ne: sector.nameNp,
        },
        value: sector.id,
      })
    )

    return formattedEntrepreneurshipActivities
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('EntrepreneurshipActivity ID is required.')
    }

    const entrepreneurshipActivity =
      await db.entrepreneurshipActivity.findUnique({
        where: {
          id: id,
        },
      })

    if (!entrepreneurshipActivity) {
      throw new BadRequestError('EntrepreneurshipActivity not found.')
    }

    return entrepreneurshipActivity
  }

  async update({
    data,
    id,
  }: {
    data: EntrepreneurshipActivityDto
    id: string
  }): Promise<string> {
    const { name, nameNp, code } = data

    if (!id) {
      throw new BadRequestError('EntrepreneurshipActivity ID is required.')
    }

    const entrepreneurshipActivity =
      await db.entrepreneurshipActivity.findUnique({
        where: {
          id,
        },
      })

    if (!entrepreneurshipActivity) {
      throw new BadRequestError('EntrepreneurshipActivity not found.')
    }

    // Check for existing EntrepreneurshipActivity with the same code (excluding current record)
    const existingSector = await db.entrepreneurshipActivity.findFirst({
      where: {
        code: code,
        id: {
          not: id,
        },
      },
    })

    if (existingSector) {
      throw new BadRequestError(
        `Another EntrepreneurshipActivity with code '${code}' already exists.`
      )
    }

    await db.entrepreneurshipActivity.update({
      where: {
        id,
      },
      data: {
        name,
        nameNp,
        code,
      },
    })

    return messages.updated('EntrepreneurshipActivity')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('EntrepreneurshipActivity ID is required.')
    }

    const entrepreneurshipActivity =
      await db.entrepreneurshipActivity.findUnique({
        where: {
          id,
        },
      })

    if (!entrepreneurshipActivity) {
      throw new BadRequestError('EntrepreneurshipActivity not found.')
    }

    await db.entrepreneurshipActivity.delete({
      where: {
        id,
      },
    })

    return messages.deleted('EntrepreneurshipActivity')
  }
}

export default EntrepreneurshipActivityService
