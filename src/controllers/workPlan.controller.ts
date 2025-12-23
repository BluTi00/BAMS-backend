import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import WorkPlanService from '../services/workPlan.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const workPlanService = new WorkPlanService()

const getWorkPlans = async (req: Request, res: Response): Promise<void> => {
  const { page, perPage, search } = validatePagination(
    req.query.currentPage as string,
    req.query.perPage as string,
    req.query.searchTerm as string
  )
  const { sortId, desc } = validateSorting(
    req.query.id as string,
    req.query.desc as string
  )
  const filters = {
    applicationId: req.query.applicationId as string,
  }

  const { workPlans, totalCount } = await workPlanService.getAll({
    paginationData: {
      page,
      perPage,
      search,
      sortId,
      desc,
    },
    filters,
  })
  res.status(StatusCodes.OK).json({
    data: workPlans,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createWorkPlan = async (req: Request, res: Response): Promise<void> => {
  const message = await workPlanService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleWorkPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  const workPlan = await workPlanService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: workPlan })
}

const updateWorkPlan = async (req: Request, res: Response): Promise<void> => {
  const message = await workPlanService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteWorkPlan = async (req: Request, res: Response): Promise<void> => {
  const message = await workPlanService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getWorkPlans,
  createWorkPlan,
  getSingleWorkPlan,
  updateWorkPlan,
  deleteWorkPlan,
}
