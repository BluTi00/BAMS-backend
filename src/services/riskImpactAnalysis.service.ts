import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { RiskImpactAnalysisDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'

class RiskImpactAnalysisService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: RiskImpactAnalysisDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const {
      isRiskAnalysisDone,
      riskFactor,
      riskMitigationPlan,
      isQualityImproved,
      isCostReduced,
      isTimeReduced,
    } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        riskImpactAnalysis: true,
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    hasPermission(application, user)

    if (user?.role === ROLE.USER) {
      if (application.status !== APPLICATION_STATUS.INCOMPLETE) {
        throw new BadRequestError('Application Already Submitted.')
      }
    }

    if (application?.riskImpactAnalysis) {
      // update riskImpactAnalysis
      await db.riskImpactAnalysis.update({
        where: {
          id: application.riskImpactAnalysis.id,
        },
        data: {
          isRiskAnalysisDone,
          riskFactor,
          riskMitigationPlan,
          isQualityImproved,
          isCostReduced,
          isTimeReduced,
        },
      })
    } else {
      // create new riskImpactAnalysis
      await db.riskImpactAnalysis.create({
        data: {
          isRiskAnalysisDone,
          riskFactor,
          riskMitigationPlan,
          isQualityImproved,
          isCostReduced,
          isTimeReduced,
          application: {
            connect: {
              id: applicationId,
            },
          },
        },
      })
    }

    return messages.updated('RiskImpactAnalysis')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const riskImpactAnalysis = await db.riskImpactAnalysis.findUnique({
      where: {
        applicationId,
      },
    })

    return riskImpactAnalysis ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Risk Impact Analysis ID is required.')
    }

    const riskImpactAnalysis = await db.riskImpactAnalysis.findUnique({
      where: {
        id,
      },
    })

    if (!riskImpactAnalysis) {
      throw new BadRequestError('Risk Impact Analysis not found.')
    }

    await db.riskImpactAnalysis.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Risk Impact Analysis')
  }
}

export default RiskImpactAnalysisService
