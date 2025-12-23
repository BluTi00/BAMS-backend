import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { MemberDto } from '../dto/member.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { includeAddress, includeMedia } from '../constants/constant'
import MediaService from './media.service'

const mediaService = new MediaService()

class MemberService {
  async create(data: MemberDto): Promise<string> {
    const {
      name,
      nameNp,
      phone,
      email,
      dateOfBirth,
      gender,
      citizenshipNumber,
      issuedDate,
      issuedDistrict,
      experience,
      qualification,
      address,
      startupSectorId,
      startupSubSector,
    } = data

    if (citizenshipNumber) {
      const existingEntrepreneur = await db.member.findFirst({
        where: {
          citizenshipNumber: citizenshipNumber,
        },
      })

      if (existingEntrepreneur) {
        throw new BadRequestError('Citizenship number already exists.')
      }
    }

    const newMember = await db.member.create({
      data: {
        name,
        nameNp,
        phone,
        email,
        dateOfBirth,
        gender,
        citizenshipNumber,
        issuedDate,
        issuedDistrict,
        experience,
        qualification,
        address: {
          create: {
            provinceId: address.provinceId,
            districtId: address.districtId,
            municipalityId: address.municipalityId,
            wardId: address.wardId,
            locality: address.locality,
          },
        },
        startupSector: {
          connect: {
            id: startupSectorId,
          },
        },
        // one to many relation
        startupSubSector: {
          connect: startupSubSector.map((id) => ({
            id: id,
          })),
        },
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
              member: {
                connect: {
                  id: newMember.id,
                },
              },
            },
          })
        })
      )
    }

    return 'Member created successfully.'
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.MemberWhereInput = search
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
            {
              phone: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    const { committeeId } = filters
    if (committeeId) {
      searchCondition.committeeMembers = {
        some: {
          committeeId: committeeId,
        },
      }
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.member.count({
      where: searchCondition,
    })

    const members = await db.member.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        address: includeAddress,
        startupSector: {
          select: {
            name: true,
            nameNp: true,
          },
        },
      },
    })

    return {
      totalCount,
      members,
    }
  }

  async getList(): Promise<any> {
    const members = await db.member.findMany()

    const formattedStartupSectors = members.map((member) => ({
      label: {
        en: `${member.name} (${member.phone})`,
        ne: `${member.nameNp} (${member.phone})`,
      },
      value: member.id,
    }))

    return formattedStartupSectors
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('Member ID is required.')
    }

    const member = await db.member.findFirst({
      where: {
        OR: [
          {
            id: id,
          },
          {
            phone: id,
          },
        ],
      },
      include: {
        address: includeAddress,
        media: includeMedia,
        startupSubSector: {
          select: {
            id: true,
            name: true,
            nameNp: true,
          },
        },
      },
    })

    return member
  }

  async update({ data, id }: { data: MemberDto; id: string }): Promise<string> {
    const {
      name,
      nameNp,
      phone,
      email,
      dateOfBirth,
      gender,
      citizenshipNumber,
      issuedDate,
      issuedDistrict,
      experience,
      qualification,
      address,
      startupSectorId,
      startupSubSector,
    } = data

    if (!id) {
      throw new BadRequestError('Member ID is required.')
    }

    const member = await db.member.findUnique({
      where: {
        id,
      },
    })

    if (!member) {
      throw new BadRequestError('Member not found.')
    }

    await db.member.update({
      where: {
        id,
      },
      data: {
        name,
        nameNp,
        phone,
        email,
        dateOfBirth,
        gender,
        citizenshipNumber,
        issuedDate,
        issuedDistrict,
        experience,
        qualification,
        address: {
          update: {
            provinceId: address?.provinceId || null,
            districtId: address?.districtId || null,
            municipalityId: address?.municipalityId || null,
            wardId: address?.wardId || null,
            locality: address?.locality || null,
          },
        },
        startupSector: {
          connect: {
            id: startupSectorId,
          },
        },
        startupSubSector: {
          set: startupSubSector.map((id) => ({
            id: id,
          })),
        },
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
              member: {
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

    return messages.updated('Member')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Member ID is required.')
    }

    const member = await db.member.findUnique({
      where: {
        id,
      },
      include: {
        media: true,
      },
    })

    if (!member) {
      throw new BadRequestError('Member not found.')
    }

    // delete media
    if (member.media?.length > 0)
      await Promise.all(
        member.media.map(async (element) => {
          await mediaService.delete(element.id)
        })
      )

    await db.member.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Member')
  }
}

export default MemberService
