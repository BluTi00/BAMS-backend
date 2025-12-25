import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import EntrepreneurshipActivityService from '../services/entrepreneurshipActivity.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const entrepreneurshipActivityService = new EntrepreneurshipActivityService()

const getEntrepreneurshipActivities = async (
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

  const { entrepreneurshipActivities, totalCount } =
    await entrepreneurshipActivityService.getAll({
      page,
      perPage,
      search,
      sortId,
      desc,
    })
  res.status(StatusCodes.OK).json({
    data: entrepreneurshipActivities,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getEntrepreneurshipActivityList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const entrepreneurshipActivities =
    await entrepreneurshipActivityService.getList()
  res.status(StatusCodes.OK).json({
    data: entrepreneurshipActivities,
  })
}

const createEntrepreneurshipActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await entrepreneurshipActivityService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleEntrepreneurshipActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const entrepreneurshipActivity =
    await entrepreneurshipActivityService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: entrepreneurshipActivity })
}

const updateEntrepreneurshipActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await entrepreneurshipActivityService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteEntrepreneurshipActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await entrepreneurshipActivityService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getEntrepreneurshipActivities,
  createEntrepreneurshipActivity,
  getSingleEntrepreneurshipActivity,
  updateEntrepreneurshipActivity,
  deleteEntrepreneurshipActivity,
  getEntrepreneurshipActivityList,
}
