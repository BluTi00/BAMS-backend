import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApplicationCycleService from '../services/applicationCycle.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const applicationCycleService = new ApplicationCycleService()

const getApplicationCycles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page, perPage, search } = validatePagination(
    req.query.currentPage as string,
    req.query.perPage as string,
    req.query.searchTerm as string
  )
  const { sortId, desc } = validateSorting(
    req.query.id as string,
    req.query.desc as string
  )

  const { applicationCycles, totalCount } =
    await applicationCycleService.getAll({
      page,
      perPage,
      search,
      sortId,
      desc,
    })
  res.status(StatusCodes.OK).json({
    data: applicationCycles,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getApplicationCycleList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const applicationCycles = await applicationCycleService.getList()
  res.status(StatusCodes.OK).json({
    data: applicationCycles,
  })
}

const createApplicationCycle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await applicationCycleService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleApplicationCycle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const applicationCycle = await applicationCycleService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: applicationCycle })
}

const updateApplicationCycle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await applicationCycleService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteApplicationCycle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await applicationCycleService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getLatestApplicationCycle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { applicationCycle, isFormOpen } =
    await applicationCycleService.getLatest()
  res.status(StatusCodes.OK).json({
    applicationCycle,
    isFormOpen,
  })
}

export {
  getApplicationCycles,
  createApplicationCycle,
  getSingleApplicationCycle,
  updateApplicationCycle,
  deleteApplicationCycle,
  getApplicationCycleList,
  getLatestApplicationCycle,
}
