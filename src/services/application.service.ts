import { APPLICATION_STATUS, Prisma, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import {
  ApplicationDto,
  UpdateApplicationStatusDto,
} from '../dto/application.dto'
import { BadRequestError, UnauthenticatedError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { includeAddress, includeMedia } from '../constants/constant'
import { TokenData } from '../server'
import {
  hasPermission,
  validateApplicationRequest,
} from '../utils/applicationValidation'
import MediaService from './media.service'
import { withSkipAudit } from '../middleware/context'
import { generateExcelFile } from '../utils/exportHelper'
import { buildOrderBy } from '../utils/validateSorting'

const mediaService = new MediaService()

class ApplicationService {
  async create(data: ApplicationDto, user: TokenData): Promise<any> {
    const {
      applicationCycleId,
      applicationCode: rawApplicationCodeOffline,
      applicantName,
      applicantNameNp,
      address,
      telephone,
      email,
      dateOfBirth,
      educationQualification,
      profession,
      fatherName,
      fatherProfession,
      useOfModernTechnology,
      possibilityOfSellingProducedGoods,
      institutionalUpgradeSupport,
      existingOperatingProfession,
      professionToBeUpgraded,
      estimatedCost,
      submissionDate,
      citizenshipNumber,
      issuedDate,
      issuedDistrict,
      programType,
      entrepreneurshipRelatedTraining,
      entrepreneurshipActivity,
    } = data

    // check if user exits
    const isUserValid = await db.user.findUnique({
      where: {
        id: user.userId,
      },
    })

    if (!isUserValid) {
      throw new UnauthenticatedError('User not found.')
    }

    if (user.role === ROLE.USER) {
      await validateApplicationRequest({
        user: user,
        applicationCycleId,
        programType,
      })
    }

    const newApplication = await db.$transaction(async (tx) => {
      let applicationCode = rawApplicationCodeOffline

      if (user.role === ROLE.USER) {
        // Atomically increment the counter
        const counter = await tx.codeCounter.update({
          where: {
            applicationCycleId: applicationCycleId,
          },
          data: { lastValue: { increment: 1 } },
        })

        if (!counter) {
          throw new BadRequestError('Code counter not found.')
        }

        applicationCode = `${counter?.prefix}-${counter?.lastValue
          .toString()
          .padStart(5, '0')}`
      }

      // Create the new application
      const newApp = await tx.application.create({
        data: {
          applicationCode,
          applicationCycle: {
            connect: {
              id: applicationCycleId,
            },
          },
          address: {
            create: {
              provinceId: address.provinceId,
              districtId: address.districtId,
              municipalityId: address.municipalityId,
              wardId: address.wardId,
              locality: address.locality,
            },
          },
          applicantName,
          applicantNameNp,
          telephone,
          email,
          dateOfBirth,
          educationQualification,
          profession,
          fatherName,
          fatherProfession,
          useOfModernTechnology,
          possibilityOfSellingProducedGoods,
          institutionalUpgradeSupport,
          existingOperatingProfession,
          professionToBeUpgraded,
          estimatedCost,
          submissionDate,
          citizenshipNumber,
          issuedDate,
          issuedDistrict,
          programType,
          entrepreneurshipRelatedTraining,
          entrepreneurshipActivity: {
            connect: entrepreneurshipActivity?.map((id) => ({ id })),
          },
          ...(user.role === ROLE.USER
            ? {
                user: {
                  connect: {
                    id: user.userId,
                  },
                },
              }
            : {
                createdByAdmin: {
                  connect: {
                    id: user.userId,
                  },
                },
              }),
        },
      })

      return newApp
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
              application: {
                connect: {
                  id: newApplication.id,
                },
              },
            },
          })
        })
      )
    }

    return messages.created('Application')
  }

  async getAll({
    paginationData: { page, perPage, sortId, desc, search },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    const {
      applicationCycleId,
      status,
      provinceId,
      districtId,
      municipalityId,
      wardId,
      attachment,
      includeDeleted,
      programType,
    } = filters

    // Build the search condition
    const searchCondition: Prisma.ApplicationWhereInput = search
      ? {
          OR: [
            {
              applicationCode: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              applicantName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              user: {
                OR: [
                  {
                    phone: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },

                  {
                    name: {
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

    // Apply filters
    if (!includeDeleted) {
      searchCondition.deletedAt = null
    }

    if (applicationCycleId) {
      searchCondition.applicationCycleId = applicationCycleId
    }

    if (status) {
      searchCondition.status = status
    }

    if (programType) {
      searchCondition.programType = programType
    }

    if (provinceId) {
      searchCondition.address = {
        provinceId: provinceId,
      }
    }

    if (districtId) {
      searchCondition.address = {
        districtId: districtId,
      }
    }

    if (municipalityId) {
      searchCondition.address = {
        municipalityId: municipalityId,
      }
    }

    if (wardId) {
      searchCondition.address = {
        wardId: wardId,
      }
    }

    if (attachment === 'NO_ATTACHMENT') {
      searchCondition.media = {
        none: {},
      }
    }

    if (attachment === 'WITH_ATTACHMENT') {
      searchCondition.media = {
        some: {},
      }
    }

    // End of building search condition

    // Get the count of records matching the search criteria
    const totalCount = await db.application.count({
      where: searchCondition,
    })

    const applications = await db.application.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage || undefined,

      include: {
        address: includeAddress,
        applicationCycle: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            nameNp: true,
          },
        },

        createdByAdmin: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return {
      totalCount,
      applications,
    }
  }

  async getById({
    id,
    user,
    checkPermission = true,
  }: {
    id: string
    user?: TokenData
    checkPermission?: boolean
  }): Promise<any> {
    if (!id) {
      throw new BadRequestError('Application ID is required.')
    }

    const application = await db.application.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        address: includeAddress,
        applicationCycle: true,
        media: includeMedia,
        entrepreneurshipActivity: true,
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    if (checkPermission) {
      hasPermission(application, user)
    }

    return application
  }

  async getOne(filters: any): Promise<any> {
    const { userId, applicationCycleId, programType } = filters

    const searchCondition: Prisma.ApplicationWhereInput = {}

    if (userId) {
      searchCondition.userId = userId
    }

    if (applicationCycleId) {
      searchCondition.applicationCycleId = applicationCycleId
    }

    if (programType) {
      searchCondition.programType = programType
    }

    const application = await db.application.findFirst({
      where: searchCondition,
      select: {
        id: true,
        applicationCode: true,
        status: true,
        createdAt: true,
      },
    })

    return application || null
  }

  // update company profile
  async update({
    data,
    id,
    user,
  }: {
    data: ApplicationDto
    id: string
    user: TokenData
  }): Promise<string> {
    if (!id) {
      throw new BadRequestError('Application ID is required.')
    }

    const application = await db.application.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    if (user?.role === ROLE.USER) {
      if (application.status === APPLICATION_STATUS.REGISTERED) {
        throw new BadRequestError('Application Already Submitted.')
      }
    }

    hasPermission(application, user)

    const {
      applicantName,
      applicantNameNp,
      address,
      telephone,
      email,
      dateOfBirth,
      educationQualification,
      profession,
      fatherName,
      fatherProfession,
      useOfModernTechnology,
      possibilityOfSellingProducedGoods,
      institutionalUpgradeSupport,
      existingOperatingProfession,
      professionToBeUpgraded,
      estimatedCost,
      submissionDate,
      citizenshipNumber,
      issuedDate,
      issuedDistrict,
      entrepreneurshipRelatedTraining,
      entrepreneurshipActivity,
    } = data

    await db.application.update({
      where: {
        id,
      },
      data: {
        applicantName,
        applicantNameNp,
        telephone,
        email,
        dateOfBirth,
        educationQualification,
        profession,
        fatherName,
        fatherProfession,
        useOfModernTechnology,
        possibilityOfSellingProducedGoods,
        institutionalUpgradeSupport,
        existingOperatingProfession,
        professionToBeUpgraded,
        estimatedCost,
        submissionDate,
        citizenshipNumber,
        issuedDate,
        issuedDistrict,
        entrepreneurshipRelatedTraining,
        entrepreneurshipActivity: {
          set: entrepreneurshipActivity?.map((id) => ({ id })),
        },
        address: {
          update: {
            provinceId: address.provinceId,
            districtId: address.districtId,
            municipalityId: address.municipalityId,
            wardId: address.wardId,
            locality: address.locality,
          },
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
              application: {
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

    return messages.updated('Company Profile')
  }

  // update status
  async updateStatus({
    id,
    data,
    userId,
  }: {
    id: string
    data: UpdateApplicationStatusDto
    userId: string
  }): Promise<string> {
    const { status, rejectionReason } = data

    if (!id) {
      throw new BadRequestError('Application ID is required.')
    }

    const application = await db.application.findUnique({
      where: {
        id,
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    await db.application.update({
      where: {
        id,
      },
      data: {
        status,
      },
    })

    withSkipAudit(async () => {
      await db.statusHistory.create({
        data: {
          applicationId: id,
          oldStatus: application.status,
          newStatus: status,
          userId,
          remark: rejectionReason || null,
        },
      })
    })

    return 'Application status updated successfully.'
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Application ID is required.')
    }

    const application = await db.application.findUnique({
      where: {
        id,
      },
      include: {
        media: true,
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    // delete application
    await db.application.delete({
      where: {
        id,
      },
    })

    // delete address
    await db.address.delete({
      where: {
        id: application.addressId,
      },
    })

    // delete media
    for (const media of application.media) {
      await mediaService.delete(media.id)
    }

    return messages.deleted('Application')
  }

  async export(data: any): Promise<any> {
    const { filters } = data

    const headers = [
      {
        header: 'आवेदन दर्ता नम्बर',
        key: 'applicationCode',
      },
      {
        header: 'आवेदकको नाम (अंग्रेजीमा)',
        key: 'applicantName',
        width: 40,
      },

      {
        header: 'आवेदकको नाम (नेपालीमा)',
        key: 'applicantNameNp',
        width: 40,
      },

      {
        header: 'परियोजनाको ठेगाना',
        key: 'address',
        width: 50,
      },

      {
        header: 'पेशा',
        key: 'profession',
        width: 50,
      },

      {
        header: 'फोन नम्बर',
        key: 'telephone',
      },

      {
        header: 'बाबुको नाम',
        key: 'fatherName',
        width: 30,
      },

      {
        header: 'परियोजनाको अनुमानित लागत (नेपालीमा)',
        key: 'estimatedCost',
      },

      {
        header: 'प्रदेश',
        key: 'province',
      },

      {
        header: 'जिल्ला',
        key: 'district',
      },
    ]

    const { applications } = await this.getAll({
      paginationData: {
        page: 1,
        perPage: 0, // Export all participants
        search: '',
        sortId: 'createdAt',
        desc: false,
      },
      filters,
    })

    const formattedData = applications.map((item: any) => {
      const provinceNameNp = item.address?.province?.provinceTitleNepali || ''
      const districtNameNp = item.address?.district?.districtTitleNepali || ''

      const municipalityNameNp =
        item.address?.municipality?.municipalityTitleNepali || ''

      const abbreviatedMunicipalityNameNp = municipalityNameNp
        .replace('गाउँपालिका', 'गा.पा.')
        .replace('उपमहानगरपालिका', 'उ.म.न.पा.')
        .replace('महानगरपालिका', 'म.न.पा.')
        .replace('नगरपालिका', 'न.पा.')

      const wardNameNp =
        item.address?.ward?.wardNumberNepali ||
        item.address?.ward?.wardNumber ||
        ''

      const address = `${abbreviatedMunicipalityNameNp} ${wardNameNp}, ${districtNameNp}`

      return {
        applicationCode: item.applicationCode,
        applicantName: item.applicantName,
        applicantNameNp: item.applicantNameNp,
        address: address,
        telephone: item?.telephone,
        fatherName: item?.fatherName,
        profession: item?.profession,
        estimatedCost: item?.estimatedCost,
        province: provinceNameNp || '',
        district: districtNameNp || '',
      }
    })

    const { exportPath, fileName } = await generateExcelFile({
      selectedHeaderKeys: headers.map((h) => h.key),
      headers: headers,
      data: formattedData,
      fileName: `Online-Applications-${new Date().getTime()}.xlsx`,
      sheetName: 'Application List',
    })

    return {
      exportPath,
      fileName,
    }
  }
}

export default ApplicationService
