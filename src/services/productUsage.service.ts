import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ProductUsageDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'

class ProductUsageService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: ProductUsageDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const {
      productOrServiceName,
      productOrServiceNature,
      targetCustomerAndMarket,
      hasTrademarkPatentDesignGeographical,
      mainFeaturesOfProductOrService,
      specialUtilityOfProductOrService,
      qualityCertificationOfProductOrService,
      technologyAdoptedInProduction,
      isTechnologySelfProduced,
      technologyAdoptionPurpose,
      sourceOfRawMaterials,
    } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        productUsage: true,
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
    if (application?.productUsage) {
      // update productUsage
      await db.productUsage.update({
        where: {
          id: application.productUsage.id,
        },
        data: {
          productOrServiceName,
          productOrServiceNature,
          targetCustomerAndMarket,
          hasTrademarkPatentDesignGeographical,
          mainFeaturesOfProductOrService,
          specialUtilityOfProductOrService,
          qualityCertificationOfProductOrService,
          technologyAdoptedInProduction,
          isTechnologySelfProduced,
          technologyAdoptionPurpose,
          sourceOfRawMaterials,
        },
      })
    } else {
      // create new productUsage
      await db.productUsage.create({
        data: {
          productOrServiceName,
          productOrServiceNature,
          targetCustomerAndMarket,
          hasTrademarkPatentDesignGeographical,
          mainFeaturesOfProductOrService,
          specialUtilityOfProductOrService,
          qualityCertificationOfProductOrService,
          technologyAdoptedInProduction,
          isTechnologySelfProduced,
          technologyAdoptionPurpose,
          sourceOfRawMaterials,
          application: {
            connect: {
              id: applicationId,
            },
          },
        },
      })
    }

    return messages.updated('ProductUsage')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const productUsage = await db.productUsage.findUnique({
      where: {
        applicationId,
      },
    })

    return productUsage ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Product Usage ID is required.')
    }

    const productUsage = await db.productUsage.findUnique({
      where: {
        id,
      },
    })

    if (!productUsage) {
      throw new BadRequestError('Product Usage not found.')
    }

    await db.productUsage.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Product Usage')
  }
}

export default ProductUsageService
