import {
  APPLICATION_STATUS,
  ASSESSMENT_TYPE,
  Prisma,
  ROLE,
} from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import {
  ApplicationDto,
  DocumentDto,
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
import DashboardService from './dashboard.service'
import ApplicationCycleService from './applicationCycle.service'
import { withSkipAudit } from '../middleware/context'
import { generateExcelFile } from '../utils/exportHelper'
import { buildOrderBy } from '../utils/validateSorting'

const applicationCycleService = new ApplicationCycleService()

const mediaService = new MediaService()
const dashboardService = new DashboardService()

class ApplicationService {
  async create(
    data: ApplicationDto,
    user: TokenData,
    applicationCycleId: string
  ): Promise<any> {
    const {
      applicationCode: rawApplicationCodeOffline,
      firmCompanyIndustryName,
      firmCompanyIndustryNameNp,
      initialRegistrationOffice,
      isAffiliatedWithEPC,
      registrationDate,
      registrationNumber,
      panNumber,
      licenseProviderOffice,
      licenseIssuanceDate,
      licenseValidityPeriod,
      officeAddress,
      officeTelephone,
      officeEmail,
      officeWebsite,
      representativeName,
      representativeDesignation,
      representativeTelephone,
      representativeMobile,
      representativeEmail,
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
        userId: user.userId,
        applicationCycleId,
      })
    }

    const prefix = 'A'

    const result = await db.$transaction(async (tx) => {
      let applicationCode: string = ''

      if (user.role === ROLE.USER) {
        // Atomically increment the counter
        const counter = await tx.codeCounter.update({
          where: {
            prefix_applicationCycleId: {
              prefix,
              applicationCycleId,
            },
          },
          data: { lastValue: { increment: 1 } },
        })

        applicationCode = `${prefix}-${counter?.lastValue
          .toString()
          .padStart(5, '0')}`
      } else {
        // normalize offline application code e.g. M1, M32, M0045 to M00001
        applicationCode = rawApplicationCodeOffline
          .trim()
          .toUpperCase()
          .replace(/^M0*/, 'M') // Replace leading M followed by zeros with M
          .replace(/^M(\d+)$/g, (_match, p1) => {
            const numberPart = p1.padStart(4, '0') // Pad the numeric part to 4 digits
            return `M${numberPart}`
          })
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
          officeAddress: {
            create: {
              provinceId: officeAddress.provinceId,
              districtId: officeAddress.districtId,
              municipalityId: officeAddress.municipalityId,
              wardId: officeAddress.wardId,
              locality: officeAddress.locality,
            },
          },
          firmCompanyIndustryName,
          firmCompanyIndustryNameNp,
          initialRegistrationOffice,
          isAffiliatedWithEPC,
          registrationDate,
          registrationNumber,
          panNumber,
          licenseProviderOffice,
          licenseIssuanceDate,
          licenseValidityPeriod,
          officeTelephone,
          officeEmail,
          officeWebsite,
          representativeName,
          representativeDesignation,
          representativeTelephone,
          representativeMobile,
          representativeEmail,
          status:
            user.role === ROLE.USER
              ? APPLICATION_STATUS.INCOMPLETE
              : APPLICATION_STATUS.REGISTERED,

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

    return {
      createdApplicationId: result.id,
      message: messages.created('Application'),
    }
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
      startupSectorId,
      attachment,
      includeDeleted,
      completedSteps,
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
              firmCompanyIndustryName: {
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

    if (provinceId) {
      searchCondition.officeAddress = {
        provinceId: provinceId,
      }
    }

    if (districtId) {
      searchCondition.officeAddress = {
        districtId: districtId,
      }
    }

    if (municipalityId) {
      searchCondition.officeAddress = {
        municipalityId: municipalityId,
      }
    }

    if (wardId) {
      searchCondition.officeAddress = {
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

    if (startupSectorId) {
      searchCondition.projectIntroduction = {
        startupSectorId: startupSectorId,
      }
    }

    if (completedSteps?.length > 0) {
      if (completedSteps.includes('productUsage')) {
        searchCondition.productUsage = {
          isNot: null,
        }
      }

      if (completedSteps.includes('entrepreneurProfile')) {
        searchCondition.entrepreneurProfile = {
          some: {},
        }
      }

      if (completedSteps.includes('projectIntroduction')) {
        searchCondition.projectIntroduction = {
          isNot: null,
        }
      }

      if (completedSteps.includes('projectAnalysis')) {
        searchCondition.projectAnalysis = {
          isNot: null,
        }
      }

      if (completedSteps.includes('riskImpactAnalysis')) {
        searchCondition.riskImpactAnalysis = {
          isNot: null,
        }
      }

      if (completedSteps.includes('swotAnalysis')) {
        searchCondition.swotAnalysis = {
          isNot: null,
        }
      }

      if (completedSteps.includes('financialAnalysis')) {
        searchCondition.financialAnalysis = {
          isNot: null,
        }
      }

      if (completedSteps.includes('workPlan')) {
        searchCondition.workPlan = {
          some: {},
        }
      }

      if (completedSteps.includes('proposer')) {
        searchCondition.proposer = {
          isNot: null,
        }
      }

      if (completedSteps.includes('document')) {
        const requiredDocuments = await db.documentSetup.findMany({
          where: {
            isActive: true,
            isRequired: true,
          },
          select: {
            id: true,
            mediaType: true,
          },
        })

        const requiredDocumentList = requiredDocuments.map(
          (doc) => doc.mediaType
        )

        // check if application has all required documents
        searchCondition.AND = requiredDocumentList.map((mediaType) => ({
          media: {
            some: {
              mediaType: mediaType,
            },
          },
        }))
      }

      if (completedSteps.includes('register')) {
        searchCondition.status = APPLICATION_STATUS.REGISTERED
      }
    }

    // End of building search condition

    // Get the count of records matching the search criteria
    const totalCount = await db.application.count({
      where: searchCondition,
    })

    const applicationList = await db.application.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage || undefined,

      include: {
        officeAddress: includeAddress,
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
        projectIntroduction: {
          select: {
            startupSector: {
              select: {
                name: true,
                nameNp: true,
              },
            },
            startupSubSector: {
              select: {
                name: true,
                nameNp: true,
              },
            },
          },
        },
        projectAnalysis: {
          select: {
            requestedLoanAmount: true,
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

    const applications: any = []

    for (const application of applicationList) {
      const checkList = await dashboardService.getCheckListByApplicationId(
        application?.id as string
      )

      applications.push({
        ...application,
        completedStepCount:
          checkList && checkList.completedStepCount
            ? checkList.completedStepCount
            : 0,
      })
    }

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
        officeAddress: includeAddress,
        applicationCycle: true,
        media: includeMedia,
        entrepreneurProfile: true,
        projectIntroduction: {
          include: {
            startupSector: true,
            startupSubSector: true,
          },
        },
        projectAnalysis: true,
        riskImpactAnalysis: true,
        swotAnalysis: true,
        financialAnalysis: true,
        workPlan: true,
        productUsage: true,
        proposer: {
          include: {
            media: includeMedia,
          },
        },
        assessments: {
          select: {
            assessmentType: true,
            isDraft: true,
          },
        },
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

  async canEdit(id: string, user: TokenData): Promise<any> {
    if (!id) {
      throw new BadRequestError('Application ID is required.')
    }

    const application = await db.application.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    hasPermission(application, user)

    let canEdit = false
    if (user?.role === ROLE.USER) {
      const { isFormOpen } = await applicationCycleService.getLatest()
      if (isFormOpen) {
        canEdit = application.status === APPLICATION_STATUS.INCOMPLETE
      }
    } else {
      canEdit = true
    }
    return canEdit
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
      if (application.status !== APPLICATION_STATUS.INCOMPLETE) {
        throw new BadRequestError('Application Already Submitted.')
      }
    }

    hasPermission(application, user)

    const {
      // applicationCode: newApplicationCode,
      firmCompanyIndustryName,
      firmCompanyIndustryNameNp,
      initialRegistrationOffice,
      isAffiliatedWithEPC,
      registrationDate,
      registrationNumber,
      panNumber,
      licenseProviderOffice,
      licenseIssuanceDate,
      licenseValidityPeriod,
      officeAddress,
      officeTelephone,
      officeEmail,
      officeWebsite,
      representativeName,
      representativeDesignation,
      representativeTelephone,
      representativeMobile,
      representativeEmail,
    } = data

    // // check if new application code is already taken
    // if (newApplicationCode !== application.applicationCode) {
    //   const alreadyExistApplication = await db.application.findFirst({
    //     where: {
    //       applicationCycleId: application.applicationCycleId,
    //       applicationCode: newApplicationCode,
    //       id: {
    //         not: id,
    //       },
    //     },
    //   })

    //   if (alreadyExistApplication) {
    //     throw new BadRequestError('Application Code already in use.')
    //   }
    // }

    await db.application.update({
      where: {
        id,
      },
      data: {
        // applicationCode:
        //   user.role === ROLE.USER
        //     ? application.applicationCode
        //     : newApplicationCode,
        firmCompanyIndustryName,
        firmCompanyIndustryNameNp,
        initialRegistrationOffice,
        isAffiliatedWithEPC,
        registrationDate,
        registrationNumber,
        panNumber,
        licenseProviderOffice,
        licenseIssuanceDate,
        licenseValidityPeriod,
        officeAddress: {
          update: {
            provinceId: officeAddress.provinceId,
            districtId: officeAddress.districtId,
            municipalityId: officeAddress.municipalityId,
            wardId: officeAddress.wardId,
            locality: officeAddress.locality,
          },
        },
        officeTelephone,
        officeEmail,
        officeWebsite,
        representativeName,
        representativeDesignation,
        representativeTelephone,
        representativeMobile,
        representativeEmail,
      },
    })

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
        rejectionReason,
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

    await db.application.delete({
      where: {
        id,
      },
    })

    // delete media
    for (const media of application.media) {
      await mediaService.delete(media.id)
    }

    return messages.deleted('Application')
  }

  async getApplicationId(user: TokenData): Promise<any> {
    if (!user) {
      throw new BadRequestError('User is required.')
    }

    if (user?.role !== ROLE.USER) {
      return null
    }

    // 1. get active application cycle
    const { applicationCycle } = await applicationCycleService.getLatest()
    if (!applicationCycle) {
      return null
    }

    // 2. get application by user id and active application cycle id
    const application = await db.application.findFirst({
      where: {
        userId: user.userId,
        applicationCycleId: applicationCycle.id,
        deletedAt: null,
      },
    })

    return application ? application.id : null
  }

  // upload document
  async uploadDocument(id: string, data: DocumentDto): Promise<string> {
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

    const { mediaCaption } = data

    if (mediaCaption) {
      await db.application.update({
        where: {
          id,
        },
        data: {
          mediaCaption,
        },
      })
    }

    return messages.updated('Document')
  }

  // register application
  async register(id: string, userId: string): Promise<string> {
    await db.application.update({
      where: {
        id,
      },
      data: {
        status: APPLICATION_STATUS.REGISTERED,
      },
    })

    await db.statusHistory.create({
      data: {
        applicationId: id,
        oldStatus: APPLICATION_STATUS.INCOMPLETE,
        newStatus: APPLICATION_STATUS.REGISTERED,
        userId,
      },
    })

    return 'Application Registered Successfully'
  }

  async export(data: any): Promise<any> {
    const { filters } = data

    const headers = [
      {
        header: 'आवेदन दर्ता नम्बर',
        key: 'applicationCode',
      },
      {
        header: 'परियोजनाको नाम (English)',
        key: 'firmCompanyIndustryName',
        width: 40,
      },
      {
        header: 'परियोजनाको नाम (नेपाली)',
        key: 'firmCompanyIndustryNameNp',
        width: 40,
      },

      {
        header: 'परियोजनाको नाम (Cleaned)',
        key: 'cleanedFirmNepaliName',
        width: 40,
      },

      {
        header: 'परियोजनाको ठेगाना',
        key: 'officeAddress',
        width: 50,
      },

      {
        header: 'मुख्य प्रस्तावकको नाम',
        key: 'representativeName',
      },

      {
        header: 'सम्पर्क',
        key: 'representativeMobile',
      },

      {
        header: 'प्रदेश',
        key: 'officeProvince',
      },

      {
        header: 'कार्यालय जिल्ला',
        key: 'officeDistrict',
      },

      {
        header: 'उद्यम क्षेत्र',
        key: 'startupSector',
      },

      {
        header: 'उद्यम उपक्षेत्र',
        key: 'startupSubSector',
      },

      {
        header: 'पान नम्बर',
        key: 'panNumber',
      },

      {
        header: 'कर्जा माग रु.',
        key: 'requestedLoanAmount',
      },

      {
        header: 'कैफियत',
        key: 'remarks',
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
      const provinceNameNp =
        item.officeAddress?.province?.provinceTitleNepali || ''

      const districtNameNp =
        item.officeAddress?.district?.districtTitleNepali || ''

      const municipalityNameNp =
        item.officeAddress?.municipality?.municipalityTitleNepali || ''

      const abbreviatedMunicipalityNameNp = municipalityNameNp
        .replace('गाउँपालिका', 'गा.पा.')
        .replace('उपमहानगरपालिका', 'उ.म.न.पा.')
        .replace('महानगरपालिका', 'म.न.पा.')
        .replace('नगरपालिका', 'न.पा.')

      const wardNameNp =
        item.officeAddress?.ward?.wardNumberNepali ||
        item.officeAddress?.ward?.wardNumber ||
        ''

      const officeAddress = `${abbreviatedMunicipalityNameNp} ${wardNameNp}, ${districtNameNp}`

      return {
        applicationCode: item.applicationCode,
        firmCompanyIndustryName: item.firmCompanyIndustryName,
        firmCompanyIndustryNameNp: item.firmCompanyIndustryNameNp,
        cleanedFirmNepaliName: item.cleanedFirmNepaliName,
        officeAddress: officeAddress,
        representativeName: item?.representativeName,
        representativeMobile: item?.representativeMobile,
        officeProvince: provinceNameNp || '',
        officeDistrict: districtNameNp || '',
        startupSector: item?.projectIntroduction?.startupSector?.nameNp || '',
        startupSubSector:
          item?.projectIntroduction?.startupSubSector?.nameNp || '',
        panNumber: item?.panNumber || '',
        requestedLoanAmount: item?.projectAnalysis
          ? item.projectAnalysis?.requestedLoanAmount
          : 0,
        remarks: item?.status === APPLICATION_STATUS.INCOMPLETE ? 'अधुरो' : '',
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

  // For Evaluation
  async getAllForAssessment({
    paginationData: { page, perPage, sortId, desc, search },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    const { applicationCycleId, status } = filters
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
              firmCompanyIndustryName: {
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
    if (applicationCycleId) {
      searchCondition.applicationCycleId = applicationCycleId
    }

    if (status) {
      if (status === 'ai-screening-pending') {
        searchCondition.assessments = {
          none: {
            assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
            isDraft: null,
          },
        }
      }

      if (status === 'evaluation-pending') {
        const scoreThreshold = await db.scoreThreshold.findFirst({
          where: {
            assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
          },
        })
        const passingScore = scoreThreshold?.passingScore || 75

        searchCondition.assessments = {
          some: {
            assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
            score: {
              gte: passingScore,
            },
          },
          none: {
            assessmentType: ASSESSMENT_TYPE.EVALUATION,
            isDraft: null,
          },
        }
      }
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.application.count({
      where: searchCondition,
    })

    const applicationList = await db.application.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc, 'asc'),
      skip: (page - 1) * perPage,
      take: perPage || undefined,

      include: {
        officeAddress: includeAddress,
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
        assessments: {
          select: {
            id: true,
            assessmentType: true,
            isDraft: true,
            score: true,
            assessor: {
              select: {
                id: true,
                name: true,
                nameNp: true,
              },
            },
          },
        },
      },
    })

    const applications: any = []

    for (const application of applicationList) {
      const checkList = await dashboardService.getCheckListByApplicationId(
        application?.id as string
      )

      applications.push({
        ...application,
        completedStepCount:
          checkList && checkList.completedStepCount
            ? checkList.completedStepCount
            : 0,
      })
    }

    return {
      totalCount,
      applications,
    }
  }
}

export default ApplicationService
