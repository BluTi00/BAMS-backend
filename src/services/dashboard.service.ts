import { APPLICATION_STATUS } from '../generated/client/client'
import { db } from '../db/db.server'
import ApplicationCycleService from './applicationCycle.service'

const applicationCycleService = new ApplicationCycleService()

class DashboardService {
  async getCheckListByUserId(userId: string): Promise<any> {
    const { applicationCycle } = await applicationCycleService.getLatest()

    if (!applicationCycle) {
      return {
        formCheckList: null,
        completedStepCount: 0,
      }
    }

    const application = await db.application.findFirst({
      where: {
        userId,
        applicationCycleId: applicationCycle.id,
        deletedAt: null,
      },
    })

    if (!application) {
      return {
        formCheckList: null,
        completedStepCount: 0,
      }
    }

    const { formCheckList, completedStepCount } =
      await this.getCheckListByApplicationId(application.id)

    return {
      formCheckList,
      completedStepCount: completedStepCount ? completedStepCount : 0,
    }
  }

  async getCheckListByApplicationId(applicationId: string): Promise<any> {
    const application = await db.application.findFirst({
      where: {
        id: applicationId,
      },
      include: {
        productUsage: {
          select: {
            id: true,
          },
        },

        entrepreneurProfile: {
          select: {
            id: true,
          },
        },
        projectIntroduction: {
          select: {
            id: true,
          },
        },
        projectAnalysis: {
          select: {
            id: true,
          },
        },
        riskImpactAnalysis: {
          select: {
            id: true,
          },
        },
        swotAnalysis: {
          select: {
            id: true,
          },
        },
        financialAnalysis: {
          select: {
            id: true,
          },
        },
        workPlan: {
          select: {
            id: true,
          },
        },
        proposer: {
          select: {
            id: true,
          },
        },
        media: {
          select: {
            id: true,
            mediaType: true,
          },
        },
      },
    })

    if (!application) {
      return {
        formCheckList: null,
        completedStepCount: 0,
      }
    }

    const requiredDocumentList = await db.documentSetup.findMany({
      where: {
        isActive: true,
        isRequired: true,
      },
    })

    const isAllRequiredDocUploaded = requiredDocumentList.every((doc) =>
      application.media.some((m) => m.mediaType === doc.mediaType)
    )

    const formCheckList: any = {
      id: application.id,
      status: application.status,
      applicationCode: application.applicationCode,
      registrationDate: application.createdAt,
      companyProfile: application.id ? true : false,
      entrepreneurProfile: application.entrepreneurProfile?.length > 0,
      productUsage: application?.productUsage?.id ? true : false,
      projectIntroduction: application?.projectIntroduction?.id ? true : false,
      projectAnalysis: application?.projectAnalysis?.id ? true : false,
      riskImpactAnalysis: application?.riskImpactAnalysis?.id ? true : false,
      swotAnalysis: application?.swotAnalysis?.id ? true : false,
      financialAnalysis: application?.financialAnalysis?.id ? true : false,
      workPlan: application.workPlan?.length > 0,
      document: isAllRequiredDocUploaded,
      proposer: application?.proposer?.id ? true : false,
      register:
        application?.status === APPLICATION_STATUS.INCOMPLETE ? false : true,
      media: application.media?.map((m) => m.mediaType) || [],
    }

    const completedStepCount = Object.values(formCheckList)?.filter(
      (value) => value === true
    ).length

    return {
      formCheckList,
      completedStepCount: completedStepCount ? completedStepCount : 0,
    }
  }
}

export default DashboardService
