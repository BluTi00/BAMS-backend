import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ApplicationCycleDto } from '../dto/applicationCycle.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class ApplicationCycleService {
  async create(data: ApplicationCycleDto): Promise<string> {
    const { name, endDate, startDate, isDisabled } = data

    // check if applicationCycle already exists ie any cycle with endDate should not be greater than new cycle startDate
    const isAlreadyExist = await db.applicationCycle.findFirst({
      where: {
        endDate: { gte: new Date(startDate) },
      },
    })
    if (isAlreadyExist) {
      throw new BadRequestError('Application Cycle already exists.')
    }

    const newApplicationCycle = await db.applicationCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isDisabled,
      },
    })

    // Create counter for application code generation
    await db.codeCounter.create({
      data: {
        prefix: 'A',
        applicationCycleId: newApplicationCycle.id,
        lastValue: 0,
      },
    })

    return messages.created('Application Cycle')
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.ApplicationCycleWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    // Get the count of records matching the search criteria
    const totalCount = await db.applicationCycle.count({
      where: searchCondition,
    })

    const applicationCycles = await db.applicationCycle.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      applicationCycles,
    }
  }

  async getList(): Promise<any> {
    const applicationCycles = await db.applicationCycle.findMany()

    const formattedApplicationCycles = applicationCycles.map((cycle) => ({
      value: cycle.id,
      label: cycle.name,
    }))

    return formattedApplicationCycles
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      return null
    }

    const applicationCycle = await db.applicationCycle.findUnique({
      where: {
        id: id,
      },
    })

    if (!applicationCycle) {
      throw new BadRequestError('Application Cycle not found.')
    }

    return applicationCycle
  }

  async update({
    data,
    id,
  }: {
    data: ApplicationCycleDto
    id: string
  }): Promise<string> {
    const { name, startDate, endDate, isDisabled } = data

    if (!id) {
      throw new BadRequestError('ApplicationCycle ID is required.')
    }

    // check if applicationCycle exists
    const applicationCycle = await db.applicationCycle.findUnique({
      where: {
        id,
      },
    })

    if (!applicationCycle) {
      throw new BadRequestError('Application Cycle not found.')
    }

    // check if applicationCycle already exists ie. any cycle with startDate and endDate should not overlap with new cycle startDate and endDate
    const isAlreadyExist = await db.applicationCycle.findFirst({
      where: {
        NOT: {
          id: applicationCycle.id,
        },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },

          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
        ],
      },
    })

    if (isAlreadyExist) {
      throw new BadRequestError('Application Cycle already exists.')
    }

    await db.applicationCycle.update({
      where: {
        id,
      },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isDisabled,
      },
    })

    return messages.updated('Application Cycle')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Application Cycle ID is required.')
    }

    const applicationCycle = await db.applicationCycle.findUnique({
      where: {
        id,
      },
    })

    if (!applicationCycle) {
      throw new BadRequestError('Application Cycle not found.')
    }

    await db.applicationCycle.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Application Cycle')
  }

  async getLatest(): Promise<{
    applicationCycle: any
    isFormOpen: boolean
  }> {
    const applicationCycle = await db.applicationCycle.findFirst({
      where: {
        isDisabled: false,
      },
      orderBy: {
        endDate: 'desc',
      },
    })

    if (!applicationCycle) {
      return {
        applicationCycle: null,
        isFormOpen: false,
      }
    }

    const today = new Date()
    const isFormOpen =
      today >= new Date(applicationCycle.startDate as Date) &&
      today <= new Date(applicationCycle.endDate as Date)

    return { applicationCycle, isFormOpen }
  }
}

export default ApplicationCycleService
