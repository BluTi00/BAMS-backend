import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { CommitteeMemberDto } from '../dto/committeeMember.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { buildOrderBy } from '../utils/validateSorting'
import MediaService from './media.service'

const mediaService = new MediaService()

class CommitteeMemberService {
  async create(data: CommitteeMemberDto): Promise<string> {
    const { committeeId, memberId, joiningDate, designation } = data

    const newCommitteeMember = await db.committeeMember.create({
      data: {
        committeeId,
        memberId,
        joiningDate,
        designation,
      },
    })

    // create media
    if (data?.media !== null && data?.media?.length > 0) {
      await Promise.all(
        data?.media.map(async (mediaData) => {
          const media = await mediaService.uploadFile(mediaData)
          await db.media.update({
            where: {
              id: media.id,
            },
            data: {
              committeeMember: {
                connect: {
                  id: newCommitteeMember.id,
                },
              },
            },
          })
        })
      )
    }

    return messages.created('Committee Member')
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.CommitteeMemberWhereInput = search
      ? {
          OR: [
            {
              member: {
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
              },
            },
          ],
        }
      : {}

    const { committeeId } = filters

    if (committeeId) {
      searchCondition.committeeId = committeeId
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.committeeMember.count({
      where: searchCondition,
    })

    const committeeMembers = await db.committeeMember.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        member: {
          select: {
            name: true,
            nameNp: true,
            phone: true,
          },
        },
      },
    })

    return {
      totalCount,
      committeeMembers,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('CommitteeMember ID is required.')
    }

    const committeeMember = await db.committeeMember.findUnique({
      where: {
        id: id,
      },
    })

    if (!committeeMember) {
      throw new BadRequestError('CommitteeMember not found.')
    }

    return committeeMember
  }

  async update({
    data,
    id,
  }: {
    data: CommitteeMemberDto
    id: string
  }): Promise<string> {
    const { committeeId, memberId, joiningDate, designation } = data

    if (!id) {
      throw new BadRequestError('CommitteeMember ID is required.')
    }

    const committeeMember = await db.committeeMember.findUnique({
      where: {
        id,
      },
    })

    if (!committeeMember) {
      throw new BadRequestError('CommitteeMember not found.')
    }

    await db.committeeMember.update({
      where: {
        id,
      },
      data: {
        committeeId,
        memberId,
        joiningDate,
        designation,
      },
    })

    // create media
    if (data?.media !== null && data?.media?.length > 0) {
      await Promise.all(
        data?.media.map(async (mediaData) => {
          const media = await mediaService.uploadFile(mediaData)
          await db.media.update({
            where: {
              id: media.id,
            },
            data: {
              committeeMember: {
                connect: {
                  id: id,
                },
              },
            },
          })
        })
      )
    }

    // delete media
    if (data?.deletedMedia !== null && data?.deletedMedia?.length > 0) {
      await Promise.all(
        data?.deletedMedia.map(async (mediaId) => {
          await mediaService.delete(mediaId)
        })
      )
    }

    return messages.updated('CommitteeMember')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('CommitteeMember ID is required.')
    }

    const committeeMember = await db.committeeMember.findUnique({
      where: {
        id,
      },
    })

    if (!committeeMember) {
      throw new BadRequestError('CommitteeMember not found.')
    }

    await db.committeeMember.delete({
      where: {
        id,
      },
    })

    return messages.deleted('CommitteeMember')
  }
}

export default CommitteeMemberService
