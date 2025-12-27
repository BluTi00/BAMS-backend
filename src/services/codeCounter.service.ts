import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { CodeCounterDto } from '../dto/codeCounter.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class CodeCounterService {
  async create(data: CodeCounterDto): Promise<string> {
    const { prefix, applicationCycleId, lastValue } = data

    // check if codeCounter already exists
    const isAlreadyExist = await db.codeCounter.findFirst({
      where: {
        prefix,
        applicationCycleId,
      },
    })

    if (isAlreadyExist) {
      throw new BadRequestError('Code Counter already exists.')
    }

    await db.codeCounter.create({
      data: {
        prefix,
        applicationCycleId,
        lastValue: lastValue || 0,
      },
    })

    return 'Code Counter created successfully.'
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.CodeCounterWhereInput = search
      ? {
          OR: [
            {
              prefix: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    // Get the count of records matching the search criteria
    const totalCount = await db.codeCounter.count({
      where: searchCondition,
    })

    const codeCounters = await db.codeCounter.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      codeCounters,
    }
  }

  async getList(): Promise<any> {
    const codeCounters = await db.codeCounter.findMany()

    const formattedCodeCounters = codeCounters.map((cycle) => ({
      value: cycle.id,
      label: cycle.prefix,
    }))

    return formattedCodeCounters
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      return null
    }

    const codeCounter = await db.codeCounter.findUnique({
      where: {
        id: id,
      },
    })

    if (!codeCounter) {
      throw new BadRequestError('Code Counter not found.')
    }

    return codeCounter
  }

  async update({
    data,
    id,
  }: {
    data: CodeCounterDto
    id: string
  }): Promise<string> {
    const { prefix, applicationCycleId, lastValue } = data

    if (!id) {
      throw new BadRequestError('CodeCounter ID is required.')
    }

    // check if codeCounter exists
    const codeCounter = await db.codeCounter.findUnique({
      where: {
        id,
      },
    })

    if (!codeCounter) {
      throw new BadRequestError('Code Counter not found.')
    }

    // check if codeCounter already exists
    const isAlreadyExist = await db.codeCounter.findFirst({
      where: {
        prefix,
        applicationCycleId,
        NOT: {
          id: codeCounter.id,
        },
      },
    })

    if (isAlreadyExist) {
      throw new BadRequestError('Code Counter already exists.')
    }

    await db.codeCounter.update({
      where: {
        id,
      },
      data: {
        prefix,
        applicationCycleId,
        lastValue: lastValue || 0,
      },
    })

    return messages.updated('Code Counter')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Code Counter ID is required.')
    }

    const codeCounter = await db.codeCounter.findUnique({
      where: {
        id,
      },
    })

    if (!codeCounter) {
      throw new BadRequestError('Code Counter not found.')
    }

    await db.codeCounter.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Code Counter')
  }
}

export default CodeCounterService
