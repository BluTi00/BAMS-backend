import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { WorkPlanDto } from '../dto/workPlan.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class WorkPlanService {
  async create(data: WorkPlanDto): Promise<string> {
    const {
      activity,
      time,
      budget,
      expectedOutcome,
      risk,
      remarks,
      applicationId,
    } = data

    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    await db.workPlan.create({
      data: {
        activity,
        time,
        budget,
        expectedOutcome,
        risk,
        remarks,
        application: {
          connect: {
            id: applicationId,
          },
        },
      },
    })
    return messages.created('Entrepreneur Profile')
  }

  async getAll({
    paginationData: { page, perPage, search, sortId, desc },
    filters,
  }: {
    paginationData: IPaginatedRequest
    filters: any
  }): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.WorkPlanWhereInput = search
      ? {
          activity: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {}

    const { applicationId } = filters

    if (!applicationId) {
      return {
        totalCount: 0,
        workPlans: [],
      }
    }

    if (applicationId) {
      searchCondition.applicationId = applicationId
    }
    // Get the count of records matching the search criteria
    const totalCount = await db.workPlan.count({
      where: searchCondition,
    })

    const workPlans = await db.workPlan.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      workPlans,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('Entrepreneur Profile ID is required.')
    }

    const workPlan = await db.workPlan.findUnique({
      where: {
        id: id,
      },
    })

    if (!workPlan) {
      throw new BadRequestError('Entrepreneur Profile not found.')
    }

    return workPlan
  }

  async update({
    data,
    id,
  }: {
    data: WorkPlanDto
    id: string
  }): Promise<string> {
    const { activity, time, budget, expectedOutcome, risk, remarks } = data

    if (!id) {
      throw new BadRequestError('WorkPlan ID is required.')
    }

    const workPlan = await db.workPlan.findUnique({
      where: {
        id,
      },
    })

    if (!workPlan) {
      throw new BadRequestError('WorkPlan not found.')
    }

    await db.workPlan.update({
      where: {
        id,
      },
      data: {
        activity,
        time,
        budget,
        expectedOutcome,
        risk,
        remarks,
      },
    })

    return messages.updated('WorkPlan')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('WorkPlan ID is required.')
    }

    const workPlan = await db.workPlan.findUnique({
      where: {
        id,
      },
    })

    if (!workPlan) {
      throw new BadRequestError('WorkPlan not found.')
    }

    await db.workPlan.delete({
      where: {
        id,
      },
    })
    return messages.deleted('WorkPlan')
  }
}

export default WorkPlanService
