import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { StartupSectorDto } from '../dto/startupSector.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class StartupSectorService {
  async create(data: StartupSectorDto): Promise<string> {
    const { name, nameNp, code } = data

    // Check for existing StartupSector with the same code
    const existingSector = await db.startupSector.findFirst({
      where: {
        code: code,
      },
    })

    if (existingSector) {
      throw new BadRequestError(
        `StartupSector with code '${code}' already exists.`
      )
    }

    await db.startupSector.create({
      data: {
        name,
        nameNp,
        code,
      },
    })
    return messages.created('StartupSector')
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.StartupSectorWhereInput = search
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
    const totalCount = await db.startupSector.count({
      where: searchCondition,
    })

    const startupSectors = await db.startupSector.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      startupSectors,
    }
  }

  async getList(): Promise<any> {
    const startupSectors = await db.startupSector.findMany()

    const formattedStartupSectors = startupSectors.map((sector) => ({
      label: {
        en: sector.name,
        ne: sector.nameNp,
      },
      value: sector.id,
    }))

    return formattedStartupSectors
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('StartupSector ID is required.')
    }

    const startupSector = await db.startupSector.findUnique({
      where: {
        id: id,
      },
    })

    if (!startupSector) {
      throw new BadRequestError('StartupSector not found.')
    }

    return startupSector
  }

  async update({
    data,
    id,
  }: {
    data: StartupSectorDto
    id: string
  }): Promise<string> {
    const { name, nameNp, code } = data

    if (!id) {
      throw new BadRequestError('StartupSector ID is required.')
    }

    const startupSector = await db.startupSector.findUnique({
      where: {
        id,
      },
    })

    if (!startupSector) {
      throw new BadRequestError('StartupSector not found.')
    }

    // Check for existing StartupSector with the same code (excluding current record)
    const existingSector = await db.startupSector.findFirst({
      where: {
        code: code,
        id: {
          not: id,
        },
      },
    })

    if (existingSector) {
      throw new BadRequestError(
        `Another StartupSector with code '${code}' already exists.`
      )
    }

    await db.startupSector.update({
      where: {
        id,
      },
      data: {
        name,
        nameNp,
        code,
      },
    })

    return messages.updated('StartupSector')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('StartupSector ID is required.')
    }

    const startupSector = await db.startupSector.findUnique({
      where: {
        id,
      },
    })

    if (!startupSector) {
      throw new BadRequestError('StartupSector not found.')
    }

    await db.startupSector.delete({
      where: {
        id,
      },
    })

    return messages.deleted('StartupSector')
  }
}

export default StartupSectorService
