import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { StartupSubSectorDto } from '../dto/startupSubSector.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { buildOrderBy } from '../utils/validateSorting'

class StartupSubSectorService {
  async create(data: StartupSubSectorDto): Promise<any> {
    const { name, nameNp, code, startupSectorId } = data

    // Check if code is unique
    const existingSubSector = await db.startupSubSector.findFirst({
      where: {
        code: code,
      },
    })

    if (existingSubSector) {
      throw new BadRequestError(
        `StartupSubSector with code '${code}' already exists.`
      )
    }

    await db.startupSubSector.create({
      data: {
        name,
        nameNp,
        startupSectorId,
      },
    })

    return messages.created('StartupSubSector')
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.StartupSubSectorWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            {
              startupSector: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        }
      : {}

    const { startupSectorId } = filters

    if (startupSectorId) {
      searchCondition.startupSectorId = startupSectorId
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.startupSubSector.count({
      where: searchCondition,
    })

    const startupSubSectors = await db.startupSubSector.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc, 'asc'),
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        startupSector: {
          select: {
            id: true,
            name: true,
            nameNp: true,
          },
        },
      },
    })

    return {
      totalCount,
      startupSubSectors,
    }
  }

  async getList(filters?: any): Promise<any> {
    const { startupSectorId } = filters

    const startupSubSectors = await db.startupSubSector.findMany({
      where: {
        startupSectorId: startupSectorId || undefined,
      },
      include: {
        startupSector: true,
      },
    })

    const formattedList = startupSubSectors.map((item) => ({
      value: item.id,
      label: {
        en: item.name,
        ne: item.nameNp,
      },
    }))

    return formattedList
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('StartupSubSector ID is required.')
    }

    const startupSubSector = await db.startupSubSector.findUnique({
      where: {
        id: id,
      },
    })

    if (!startupSubSector) {
      throw new BadRequestError('StartupSubSector not found.')
    }

    return startupSubSector
  }

  async update({
    data,
    id,
  }: {
    data: StartupSubSectorDto
    id: string
  }): Promise<string> {
    const { name, nameNp, code } = data

    if (!id) {
      throw new BadRequestError('StartupSubSector ID is required.')
    }

    const startupSubSector = await db.startupSubSector.findUnique({
      where: {
        id,
      },
    })

    if (!startupSubSector) {
      throw new BadRequestError('StartupSubSector not found.')
    }

    // Check if is unique
    const existingSubSector = await db.startupSubSector.findFirst({
      where: {
        code: code,
        id: {
          not: id,
        },
      },
    })

    if (existingSubSector) {
      throw new BadRequestError(
        `StartupSubSector with code '${code}' already exists.`
      )
    }

    await db.startupSubSector.update({
      where: {
        id,
      },
      data: {
        name,
        nameNp,
        code,
      },
    })

    return messages.updated('StartupSubSector')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('StartupSubSector ID is required.')
    }

    const startupSubSector = await db.startupSubSector.findUnique({
      where: {
        id,
      },
    })

    if (!startupSubSector) {
      throw new BadRequestError('StartupSubSector not found.')
    }

    await db.startupSubSector.delete({
      where: {
        id,
      },
    })

    return messages.deleted('StartupSubSector')
  }
}

export default StartupSubSectorService
