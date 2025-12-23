import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { DocumentSetupDto } from '../dto/documentSetup.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { buildOrderBy } from '../utils/validateSorting'

class DocumentSetupService {
  async create(data: DocumentSetupDto): Promise<string> {
    const {
      name,
      nameNp,
      mediaType,
      isActive,
      isRequired,
      acceptedExtensions,
      visibilityOrder,
    } = data

    await db.documentSetup.create({
      data: {
        name,
        nameNp,
        mediaType,
        isActive,
        isRequired: isActive ? isRequired : false,
        acceptedExtensions,
        visibilityOrder,
      },
    })
    return messages.created('DocumentSetup')
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.DocumentSetupWhereInput = search
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
    const totalCount = await db.documentSetup.count({
      where: searchCondition,
    })

    const documentSetups = await db.documentSetup.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc, 'asc'),
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      documentSetups,
    }
  }

  async getList(): Promise<any> {
    const documentSetups = await db.documentSetup.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          visibilityOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    })
    return documentSetups
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('DocumentSetup ID is required.')
    }

    const documentSetup = await db.documentSetup.findUnique({
      where: {
        id: id,
      },
    })

    if (!documentSetup) {
      throw new BadRequestError('DocumentSetup not found.')
    }

    return documentSetup
  }

  async update({
    data,
    id,
  }: {
    data: DocumentSetupDto
    id: string
  }): Promise<string> {
    const {
      name,
      nameNp,
      mediaType,
      isActive,
      isRequired,
      acceptedExtensions,
      visibilityOrder,
    } = data

    if (!id) {
      throw new BadRequestError('DocumentSetup ID is required.')
    }

    const documentSetup = await db.documentSetup.findUnique({
      where: {
        id,
      },
    })

    if (!documentSetup) {
      throw new BadRequestError('DocumentSetup not found.')
    }

    await db.documentSetup.update({
      where: {
        id,
      },
      data: {
        name,
        nameNp,
        mediaType,
        isActive,
        isRequired: isActive ? isRequired : false,
        acceptedExtensions,
        visibilityOrder,
      },
    })

    return messages.updated('DocumentSetup')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('DocumentSetup ID is required.')
    }

    const documentSetup = await db.documentSetup.findUnique({
      where: {
        id,
      },
    })

    if (!documentSetup) {
      throw new BadRequestError('DocumentSetup not found.')
    }

    await db.documentSetup.delete({
      where: {
        id,
      },
    })

    return messages.deleted('DocumentSetup')
  }
}

export default DocumentSetupService
