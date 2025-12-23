import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { CommitteeDto } from '../dto/committee.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class CommitteeService {
  async create(data: CommitteeDto): Promise<any> {
    const { name, nameNp, formationDate, type, remarks } = data

    const newCommittee = await db.committee.create({
      data: {
        name,
        nameNp,
        formationDate,
        type,
        remarks,
      },
    })
    return {
      message: messages.created('Committee'),
      newlyCreatedId: newCommittee.id,
    }
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.CommitteeWhereInput = search
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
    const totalCount = await db.committee.count({
      where: searchCondition,
    })

    const committees = await db.committee.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: {
          select: {
            committeeMembers: true,
          },
        },
      },
    })

    return {
      totalCount,
      committees,
    }
  }

  async getList(): Promise<any> {
    const committees = await db.committee.findMany()

    const formattedCommittees = committees.map((committee) => ({
      label: {
        en: committee.name,
        ne: committee.nameNp,
      },
      value: committee.id,
    }))

    return formattedCommittees
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('Committee ID is required.')
    }

    const committee = await db.committee.findUnique({
      where: {
        id: id,
      },
    })

    if (!committee) {
      throw new BadRequestError('Committee not found.')
    }

    return committee
  }

  async update({
    data,
    id,
  }: {
    data: CommitteeDto
    id: string
  }): Promise<string> {
    const { name, nameNp, formationDate, type, remarks } = data

    if (!id) {
      throw new BadRequestError('Committee ID is required.')
    }

    const committee = await db.committee.findUnique({
      where: {
        id,
      },
    })

    if (!committee) {
      throw new BadRequestError('Committee not found.')
    }

    await db.committee.update({
      where: {
        id,
      },
      data: {
        name,
        nameNp,
        formationDate,
        type,
        remarks,
      },
    })

    return messages.updated('Committee')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Committee ID is required.')
    }

    const committee = await db.committee.findUnique({
      where: {
        id,
      },
    })

    if (!committee) {
      throw new BadRequestError('Committee not found.')
    }

    await db.committee.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Committee')
  }
}

export default CommitteeService
