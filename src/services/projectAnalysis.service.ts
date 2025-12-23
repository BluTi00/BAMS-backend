import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ProjectAnalysisDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'

class ProjectAnalysisService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: ProjectAnalysisDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const {
      isEstablishedMoreThan10Years,
      isAnnualTurnoverExceeded15Crores,
      isInnovativeTechnologyUsed,
      selfInvestmentAmount,
      requestedLoanAmount,
      lastFiscalYearSalesAmount,
      isBlacklistedInCreditBureau,
      isOtherGovGrantReceived,
      innovativeWork,
      innovativeWorkDescription,
      nextYearEstimatedJobCreation,
      productMarket,
      rawMaterialSource,
      entrepreneurialExperience,
      isRegisteredAsStartup,
      isTechEnabled,
    } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        projectAnalysis: true,
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

    if (application?.projectAnalysis) {
      // update projectAnalysis
      await db.projectAnalysis.update({
        where: {
          id: application.projectAnalysis.id,
        },
        data: {
          isEstablishedMoreThan10Years,
          isAnnualTurnoverExceeded15Crores,
          isInnovativeTechnologyUsed,
          selfInvestmentAmount,
          requestedLoanAmount,
          lastFiscalYearSalesAmount,
          isBlacklistedInCreditBureau,
          isOtherGovGrantReceived,
          innovativeWork,
          innovativeWorkDescription,
          nextYearEstimatedJobCreation,
          productMarket,
          rawMaterialSource,
          entrepreneurialExperience,
          isRegisteredAsStartup,
          isTechEnabled,
        },
      })
    } else {
      // create new projectAnalysis
      await db.projectAnalysis.create({
        data: {
          isEstablishedMoreThan10Years,
          isAnnualTurnoverExceeded15Crores,
          isInnovativeTechnologyUsed,
          selfInvestmentAmount,
          requestedLoanAmount,
          lastFiscalYearSalesAmount,
          isBlacklistedInCreditBureau,
          isOtherGovGrantReceived,
          innovativeWork,
          innovativeWorkDescription,
          nextYearEstimatedJobCreation,
          productMarket,
          rawMaterialSource,
          entrepreneurialExperience,
          application: {
            connect: {
              id: applicationId,
            },
          },
          isRegisteredAsStartup,
          isTechEnabled,
        },
      })
    }

    return messages.updated('ProjectAnalysis')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const projectAnalysis = await db.projectAnalysis.findUnique({
      where: {
        applicationId,
      },
    })

    return projectAnalysis ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Project Analysis ID is required.')
    }

    const projectAnalysis = await db.projectAnalysis.findUnique({
      where: {
        id,
      },
    })

    if (!projectAnalysis) {
      throw new BadRequestError('Product Analysis not found.')
    }

    await db.projectAnalysis.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Product Analysis')
  }
}

export default ProjectAnalysisService
