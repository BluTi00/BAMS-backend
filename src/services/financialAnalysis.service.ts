import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { FinancialAnalysisDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'

class FinancialAnalysisService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: FinancialAnalysisDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const {
      totalEstimatedCostOfProject,
      totalCostIncurredInProjectSoFar,
      sourceOfInvestment,
      operatingExpenseProjection,
      fiscalYear,
      annualIncomeAndProfitLossDetails,
      enterpriseAndWorkforceInsurance,
      riskMitigationMeasures,
      reinvestmentRatioFromProfit,
      selfInvestmentRatioInTotalLoanInvestment,
      principalAndInterestPaymentDetailsOnLoanInvestment,
    } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        financialAnalysis: true,
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

    if (application?.financialAnalysis) {
      // update financialAnalysis
      await db.financialAnalysis.update({
        where: {
          id: application.financialAnalysis.id,
        },
        data: {
          totalEstimatedCostOfProject,
          totalCostIncurredInProjectSoFar,
          sourceOfInvestment,
          operatingExpenseProjection,
          fiscalYear,
          annualIncomeAndProfitLossDetails,
          enterpriseAndWorkforceInsurance,
          riskMitigationMeasures,
          reinvestmentRatioFromProfit,
          selfInvestmentRatioInTotalLoanInvestment,
          principalAndInterestPaymentDetailsOnLoanInvestment,
        },
      })
    } else {
      // create new financialAnalysis
      await db.financialAnalysis.create({
        data: {
          totalEstimatedCostOfProject,
          totalCostIncurredInProjectSoFar,
          sourceOfInvestment,
          operatingExpenseProjection,
          fiscalYear,
          annualIncomeAndProfitLossDetails,
          enterpriseAndWorkforceInsurance,
          riskMitigationMeasures,
          reinvestmentRatioFromProfit,
          selfInvestmentRatioInTotalLoanInvestment,
          principalAndInterestPaymentDetailsOnLoanInvestment,
          application: {
            connect: {
              id: applicationId,
            },
          },
        },
      })
    }

    return messages.updated('FinancialAnalysis')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const financialAnalysis = await db.financialAnalysis.findUnique({
      where: {
        applicationId,
      },
    })

    return financialAnalysis ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Financial Analysis ID is required.')
    }

    const financialAnalysis = await db.financialAnalysis.findUnique({
      where: {
        id,
      },
    })

    if (!financialAnalysis) {
      throw new BadRequestError('Financial Analysis not found.')
    }

    await db.financialAnalysis.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Financial Analysis')
  }
}

export default FinancialAnalysisService
