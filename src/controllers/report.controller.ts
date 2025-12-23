import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ReportService from '../services/report.service'

const reportService = new ReportService()

const getReport = async (req: Request, res: Response): Promise<void> => {
  const data = await reportService.getReport()

  res.status(StatusCodes.OK).json({
    data,
  })
}

export { getReport }
