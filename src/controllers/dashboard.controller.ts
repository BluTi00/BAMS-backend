import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import DashboardService from '../services/dashboard.service'

const dashboardService = new DashboardService()

const getFormCheckListByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { formCheckList, completedStepCount } =
    await dashboardService.getApplicationByUserId(req.params.id)
  res.status(StatusCodes.OK).json({
    formCheckList,
    completedStepCount,
  })
}

export { getFormCheckListByUser }
