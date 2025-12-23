import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ScoreThresholdDto } from '../dto/scoreThreshold.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'

class ScoreThresholdService {
  async create(data: ScoreThresholdDto): Promise<string> {
    const { assessmentType, passingScore } = data

    await db.scoreThreshold.create({
      data: {
        assessmentType,
        passingScore,
      },
    })
    return messages.created('ScoreThreshold')
  }

  async getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.ScoreThresholdWhereInput = search ? {} : {}

    // Get the count of records matching the search criteria
    const totalCount = await db.scoreThreshold.count({
      where: searchCondition,
    })

    const scoreThresholds = await db.scoreThreshold.findMany({
      where: searchCondition,
      orderBy: {
        [sortId || 'createdAt']: desc ? 'asc' : 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      scoreThresholds,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('ScoreThreshold ID is required.')
    }

    const scoreThreshold = await db.scoreThreshold.findUnique({
      where: {
        id: id,
      },
    })

    if (!scoreThreshold) {
      throw new BadRequestError('ScoreThreshold not found.')
    }

    return scoreThreshold
  }

  async update({
    data,
    id,
  }: {
    data: ScoreThresholdDto
    id: string
  }): Promise<string> {
    const { assessmentType, passingScore } = data

    if (!id) {
      throw new BadRequestError('ScoreThreshold ID is required.')
    }

    const scoreThreshold = await db.scoreThreshold.findUnique({
      where: {
        id,
      },
    })

    if (!scoreThreshold) {
      throw new BadRequestError('ScoreThreshold not found.')
    }

    await db.scoreThreshold.update({
      where: {
        id,
      },
      data: {
        assessmentType,
        passingScore,
      },
    })

    return messages.updated('ScoreThreshold')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('ScoreThreshold ID is required.')
    }

    const scoreThreshold = await db.scoreThreshold.findUnique({
      where: {
        id,
      },
    })

    if (!scoreThreshold) {
      throw new BadRequestError('ScoreThreshold not found.')
    }

    await db.scoreThreshold.delete({
      where: {
        id,
      },
    })

    return messages.deleted('ScoreThreshold')
  }
}

export default ScoreThresholdService
