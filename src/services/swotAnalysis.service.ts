import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { SwotAnalysisDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'

class SwotAnalysisService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: SwotAnalysisDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const {
      strength,
      weakness,
      opportunity,
      threat,
      productionStartDate,
      expectedProductionStartDate,
      expectedProfitableFiscalYear,
      isElectricityAvailable,
      isRoadAvailable,
      isCommunicationAvailable,
      isDrinkingWaterAvailable,
      isBuildingAvailable,
      otherFacilities,
      landAvailability,
      partnershipDetailsInProject,
      isWasteMaterialReused,
      involvedCommunityDetails,
    } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        swotAnalysis: true,
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

    if (application?.swotAnalysis) {
      // update swotAnalysis
      await db.swotAnalysis.update({
        where: {
          id: application.swotAnalysis.id,
        },
        data: {
          strength,
          weakness,
          opportunity,
          threat,
          productionStartDate,
          expectedProductionStartDate,
          expectedProfitableFiscalYear,
          isElectricityAvailable,
          isRoadAvailable,
          isCommunicationAvailable,
          isDrinkingWaterAvailable,
          isBuildingAvailable,
          otherFacilities,
          landAvailability,
          partnershipDetailsInProject,
          isWasteMaterialReused,
          involvedCommunityDetails,
        },
      })
    } else {
      // create new swotAnalysis
      await db.swotAnalysis.create({
        data: {
          strength,
          weakness,
          opportunity,
          threat,
          productionStartDate,
          expectedProductionStartDate,
          expectedProfitableFiscalYear,
          isElectricityAvailable,
          isRoadAvailable,
          isCommunicationAvailable,
          isDrinkingWaterAvailable,
          isBuildingAvailable,
          otherFacilities,
          application: {
            connect: {
              id: applicationId,
            },
          },
          landAvailability,
          partnershipDetailsInProject,
          isWasteMaterialReused,
          involvedCommunityDetails,
        },
      })
    }

    return messages.updated('SwotAnalysis')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const swotAnalysis = await db.swotAnalysis.findUnique({
      where: {
        applicationId,
      },
    })

    return swotAnalysis ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Swot Analysis ID is required.')
    }

    const swotAnalysis = await db.swotAnalysis.findUnique({
      where: {
        id,
      },
    })

    if (!swotAnalysis) {
      throw new BadRequestError('Swot Analysis not found.')
    }

    await db.swotAnalysis.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Swot Analysis')
  }
}

export default SwotAnalysisService
