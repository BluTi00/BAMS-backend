import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import AnalyticsService from '../services/analytics.service'

const analyticsService = new AnalyticsService()

const getStatsSummaryAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  const statsSummary = await analyticsService.getStatSummary(
    req.query.applicationCycleId as string
  )

  res.status(StatusCodes.OK).json({
    data: statsSummary,
  })
}

const getDateWiseAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filters = {
    applicationCycleId: req.query.applicationCycleId,
    date: (req.query.date as string) || undefined,
  }

  const dateWiseData = await analyticsService.getDateWise(filters)

  res.status(StatusCodes.OK).json({
    data: dateWiseData,
  })
}

export { getStatsSummaryAnalytics, getDateWiseAnalytics }
