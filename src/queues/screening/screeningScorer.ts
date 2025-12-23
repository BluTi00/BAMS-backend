import { evaluateAppByOpenAI } from './openAIEvaluator'
import { db } from '../../db/db.server'
import { includeAddress, includeMedia } from '../../constants/constant'
import { ASSESSMENT_TYPE } from '../../generated/client/client'

export const getScreeningScore = async (
  applicationId: string
): Promise<any> => {
  // check if screening is already done
  const existingAssessment = await db.assessment.findFirst({
    where: {
      applicationId,
      assessmentType: ASSESSMENT_TYPE.AI_SCREENING,
    },
  })

  if (existingAssessment) {
    return
  }

  // fetch application with necessary relations
  const application = await db.application.findUnique({
    where: {
      id: applicationId,
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
    return
  }

  const projectAnalysis = application?.projectAnalysis
  const productUsage = application?.productUsage
  const financialAnalysis = application?.financialAnalysis
  const swotAnalysis = application?.swotAnalysis

  // ------- AI BASED EVALUATION CRITERIA ---------
  // Check Eligibility criteria
  // Criteria 1: Must have status as 'REGISTERED'
  if (application.status === 'INCOMPLETE') {
    return {
      rejectionReason: 'Application status is INCOMPLETE',
    }
  }

  // Criteria 2: Must have at least one media uploaded
  if ((application.media?.length || 0) === 0) {
    return {
      rejectionReason: 'No documents uploaded',
    }
  }

  // Criteria 3: Must have completed at least one of the key sections i.e. financialAnalysis, productUsage, projectAnalysis, swotAnalysis, projectIntroduction, riskImpactAnalysis, swotAnalysis, workPlan

  const hasMissingKeySection = !(
    productUsage ||
    projectAnalysis ||
    swotAnalysis ||
    application.projectIntroduction ||
    application.riskImpactAnalysis ||
    financialAnalysis ||
    application.workPlan
  )

  if (hasMissingKeySection) {
    return {
      rejectionReason:
        'At least one of the key sections must be completed by the applicant',
    }
  }

  // If eligible, proceed with AI evaluation
  const aiResult = await evaluateAppByOpenAI(applicationId)
  return aiResult
}
