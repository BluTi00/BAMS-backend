import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { AssessmentDto, UpdateAssessmentDto } from '../dto/assessment.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import { TokenData } from '../server'
import DashboardService from './dashboard.service'
import { populateEvaluationScoreSheet } from '../utils/preEvalautionScorer'

const dashboardService = new DashboardService()

class AssessmentService {
  async create(data: AssessmentDto, user: TokenData): Promise<string> {
    const { applicationId, assessmentType, scoreSheet, score, remarks } = data

    await db.assessment.create({
      data: {
        applicationId,
        assessmentType,
        assessorId: user?.userId,
        scoreSheet,
        score,
        remarks,
      },
    })
    return 'Assessment created successfully.'
  }

  async getAll({
    paginationData: { page, perPage, sortId, desc, search },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.AssessmentWhereInput = search ? {} : {}

    const { assessmentType, qualificationStatus } = filters

    if (!assessmentType) {
      return { totalCount: 0, assessments: [] }
    }

    searchCondition.isDraft = null
    searchCondition.assessmentType = assessmentType

    const scoreThreshold = await db.scoreThreshold.findFirst({
      where: {
        assessmentType: assessmentType,
      },
    })
    const passingScore = scoreThreshold?.passingScore || 75

    if (qualificationStatus) {
      if (qualificationStatus === 'QUALIFIED') {
        searchCondition.score = {
          gte: passingScore,
        }
      }

      if (qualificationStatus === 'NOT_QUALIFIED') {
        searchCondition.score = {
          lt: passingScore,
        }
      }
    }

    // Get the count of records matching the search criteria
    const totalCount = await db.assessment.count({
      where: searchCondition,
    })

    const assessments = await db.assessment.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        application: {
          select: {
            id: true,
            applicationCode: true,
            firmCompanyIndustryName: true,
            firmCompanyIndustryNameNp: true,
            assessments: {
              select: {
                id: true,
                assessmentType: true,
                score: true,
              },
            },
            projectIntroduction: {
              select: {
                startupSector: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
        assessor: true,
      },
    })

    const formattedAssessments: any = []

    for (const assessment of assessments) {
      const checkList = await dashboardService.getCheckListByApplicationId(
        assessment?.applicationId
      )

      formattedAssessments.push({
        ...assessment,
        isQualified: (assessment?.score || 0) >= passingScore,
        completedStepCount:
          checkList && checkList.completedStepCount
            ? checkList.completedStepCount
            : 0,
      })
    }

    return {
      totalCount,
      assessments: formattedAssessments,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('Assessment ID is required.')
    }

    const assessment = await db.assessment.findUnique({
      where: {
        id: id,
      },
      include: {
        application: {
          select: {
            id: true,
            applicationCode: true,
            firmCompanyIndustryName: true,
            firmCompanyIndustryNameNp: true,
            assessments: {
              select: {
                id: true,
                assessmentType: true,
                score: true,
              },
            },
            projectIntroduction: {
              select: {
                startupSector: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!assessment) {
      throw new BadRequestError('Assessment not found.')
    }

    return assessment
  }

  // Get one by params
  async getOne(filters: any): Promise<any> {
    const { userId, assessmentType, isDraft } = filters

    if (!userId || !assessmentType) {
      return null
    }

    const assessment = await db.assessment.findFirst({
      where: {
        assessorId: userId,
        assessmentType: assessmentType,
        isDraft: isDraft ? true : null,
      },
      include: {
        application: {
          select: {
            applicationCode: true,
            firmCompanyIndustryName: true,
            firmCompanyIndustryNameNp: true,
          },
        },
      },
    })

    return assessment
  }

  async update({
    data,
    id,
  }: {
    data: UpdateAssessmentDto
    id: string
  }): Promise<string> {
    const { scoreSheet, score, remarks, isDraft } = data

    if (!id) {
      throw new BadRequestError('Assessment ID is required.')
    }

    const assessment = await db.assessment.findUnique({
      where: {
        id,
      },
    })

    if (!assessment) {
      throw new BadRequestError('Assessment not found.')
    }

    await db.assessment.update({
      where: {
        id,
      },
      data: {
        scoreSheet,
        score,
        remarks,
        isDraft: isDraft ? true : null, // do not replace null with false
      },
    })

    return messages.updated('Assessment')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Assessment ID is required.')
    }

    const assessment = await db.assessment.findUnique({
      where: {
        id,
      },
    })

    if (!assessment) {
      throw new BadRequestError('Assessment not found.')
    }

    await db.assessment.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Assessment')
  }

  async createDraft(data: AssessmentDto, user: TokenData): Promise<string> {
    const { applicationId, assessmentType } = data

    // check if applicationId is valid
    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        projectIntroduction: {
          select: {
            startupSector: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      throw new BadRequestError('Invalid application ID.')
    }

    // check if user + applicationId + assessmentType already exists as draft
    const isUserAlreadyAssessing = await db.assessment.findFirst({
      where: {
        assessmentType,
        assessorId: user?.userId,
        isDraft: true,
      },
    })

    if (isUserAlreadyAssessing) {
      throw new BadRequestError(
        'You are already assessing another application. Please complete or discard that assessment before starting a new one.'
      )
    }

    // check if assessment already exists for the application and assessor
    const existingAssessment = await db.assessment.findFirst({
      where: {
        applicationId,
        assessmentType,
        isDraft: null,
      },
    })

    if (existingAssessment) {
      // For Re-Evaluation,
      await db.assessment.update({
        where: { id: existingAssessment.id },
        data: {
          isDraft: true,
          assessorId: user?.userId,
        },
      })
      return existingAssessment.id
    }

    // To create a draft is to create a new assessment of type Evaluation with the score and scoreSheet populated
    const { scoreSheet, score } =
      await populateEvaluationScoreSheet(applicationId)

    const newAssessment = await db.assessment.create({
      data: {
        applicationId,
        assessmentType,
        assessorId: user?.userId,
        isDraft: true,
        score,
        scoreSheet: scoreSheet as any,
      },
    })
    return newAssessment.id
  }

  // Manually forward the AI Assessed application for Expert Evaluation if needed
  // This is to override the automatic qualification done by AI
  async forward(assessmentId: string): Promise<any> {
    if (!assessmentId) {
      throw new BadRequestError('Assessment ID is required.')
    }

    const assessment = await db.assessment.findUnique({
      where: {
        id: assessmentId,
      },
    })

    if (!assessment) {
      throw new BadRequestError('Assessment not found.')
    }

    // Get the minimum passing score for the assessment type
    const scoreThreshold = await db.scoreThreshold.findFirst({
      where: {
        assessmentType: assessment.assessmentType,
      },
    })
    const passingScore = scoreThreshold?.passingScore || 75

    await db.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        score: passingScore,
        remarks: 'Manually forwarded for Expert Evaluation.',
        originalScore: assessment.score,
      },
    })

    return 'Assessment updated successfully.'
  }
}

export default AssessmentService
