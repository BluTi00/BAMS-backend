import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { EntrepreneurProfileDto } from '../dto/entrepreneurProfile.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { includeAddress } from '../constants/constant'

class EntrepreneurProfileService {
  async create(data: EntrepreneurProfileDto): Promise<string> {
    const {
      name,
      citizenshipNumber,
      issuedDate,
      issuedDistrict,
      temporaryAddress,
      permanentAddress,
      mobileNumber,
      applicationId,
      gender,
      isMainEntrepreneur,
      educationalQualification,
      training,
      experience,
    } = data

    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    if (citizenshipNumber) {
      const existingEntrepreneur = await db.entrepreneurProfile.findFirst({
        where: {
          applicationId,
          citizenshipNumber: citizenshipNumber,
        },
      })

      if (existingEntrepreneur) {
        throw new BadRequestError('Citizenship number already exists.')
      }
    }

    if (isMainEntrepreneur) {
      await db.entrepreneurProfile.updateMany({
        where: {
          applicationId,
          isMainEntrepreneur: true,
        },
        data: {
          isMainEntrepreneur: false,
        },
      })
    }

    await db.entrepreneurProfile.create({
      data: {
        name,
        citizenshipNumber,
        issuedDate,
        issuedDistrict,
        temporaryAddress: {
          create: {
            provinceId: temporaryAddress.provinceId,
            districtId: temporaryAddress.districtId,
            municipalityId: temporaryAddress.municipalityId,
            wardId: temporaryAddress.wardId,
            locality: temporaryAddress.locality,
          },
        },
        permanentAddress: {
          create: {
            provinceId: permanentAddress.provinceId,
            districtId: permanentAddress.districtId,
            municipalityId: permanentAddress.municipalityId,
            wardId: permanentAddress.wardId,
            locality: permanentAddress.locality,
          },
        },
        mobileNumber,
        application: {
          connect: {
            id: applicationId,
          },
        },
        gender,
        isMainEntrepreneur,
        educationalQualification,
        training,
        experience,
      },
    })

    await this.ensureMainEntrepreneur(applicationId)

    return messages.created('Entrepreneur Profile')
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.EntrepreneurProfileWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {}

    const { applicationId } = filters

    if (!applicationId) {
      return {
        totalCount: 0,
        entrepreneurProfiles: [],
      }
    }

    if (applicationId) {
      searchCondition.applicationId = applicationId
    }
    // Get the count of records matching the search criteria
    const totalCount = await db.entrepreneurProfile.count({
      where: searchCondition,
    })

    const entrepreneurProfiles = await db.entrepreneurProfile.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        permanentAddress: includeAddress,
      },
    })

    return {
      totalCount,
      entrepreneurProfiles,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('Entrepreneur Profile ID is required.')
    }

    const entrepreneurProfile = await db.entrepreneurProfile.findUnique({
      where: {
        id: id,
      },
      include: {
        temporaryAddress: includeAddress,
        permanentAddress: includeAddress,
      },
    })

    if (!entrepreneurProfile) {
      throw new BadRequestError('Entrepreneur Profile not found.')
    }

    return entrepreneurProfile
  }

  async update({
    data,
    id,
  }: {
    data: EntrepreneurProfileDto
    id: string
  }): Promise<string> {
    const {
      name,
      citizenshipNumber,
      issuedDate,
      issuedDistrict,
      temporaryAddress,
      permanentAddress,
      mobileNumber,
      gender,
      isMainEntrepreneur,
      applicationId,
      educationalQualification,
      training,
      experience,
    } = data

    if (!id) {
      throw new BadRequestError('EntrepreneurProfile ID is required.')
    }

    const entrepreneurProfile = await db.entrepreneurProfile.findUnique({
      where: {
        id,
      },
    })

    if (!entrepreneurProfile) {
      throw new BadRequestError('EntrepreneurProfile not found.')
    }

    if (isMainEntrepreneur) {
      await db.entrepreneurProfile.updateMany({
        where: {
          applicationId,
          isMainEntrepreneur: true,
        },
        data: {
          isMainEntrepreneur: false,
        },
      })
    }

    await db.entrepreneurProfile.update({
      where: {
        id,
      },
      data: {
        name,
        citizenshipNumber,
        issuedDate,
        issuedDistrict,
        temporaryAddress: {
          update: {
            provinceId: temporaryAddress.provinceId,
            districtId: temporaryAddress.districtId,
            municipalityId: temporaryAddress.municipalityId,
            wardId: temporaryAddress.wardId,
            locality: temporaryAddress.locality,
          },
        },
        permanentAddress: {
          update: {
            provinceId: permanentAddress.provinceId,
            districtId: permanentAddress.districtId,
            municipalityId: permanentAddress.municipalityId,
            wardId: permanentAddress.wardId,
            locality: permanentAddress.locality,
          },
        },
        mobileNumber,
        gender,
        isMainEntrepreneur,
        educationalQualification,
        training,
        experience,
      },
    })

    await this.ensureMainEntrepreneur(applicationId)

    return messages.updated('EntrepreneurProfile')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('EntrepreneurProfile ID is required.')
    }

    const entrepreneurProfile = await db.entrepreneurProfile.findUnique({
      where: {
        id,
      },
    })

    if (!entrepreneurProfile) {
      throw new BadRequestError('EntrepreneurProfile not found.')
    }

    const applicationId = entrepreneurProfile.applicationId

    await db.entrepreneurProfile.delete({
      where: {
        id,
      },
    })

    await this.ensureMainEntrepreneur(applicationId as string)
    return messages.deleted('EntrepreneurProfile')
  }

  // ensure at least one entrepreneur is main entrepreneur
  async ensureMainEntrepreneur(applicationId: string): Promise<void> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const mainEntrepreneur = await db.entrepreneurProfile.findFirst({
      where: {
        applicationId,
        isMainEntrepreneur: true,
      },
    })

    if (!mainEntrepreneur) {
      const newMainEntrepreneur = await db.entrepreneurProfile.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (newMainEntrepreneur) {
        await db.entrepreneurProfile.update({
          where: {
            id: newMainEntrepreneur.id,
          },
          data: {
            isMainEntrepreneur: true,
          },
        })
      }
    }
  }
}

export default EntrepreneurProfileService
