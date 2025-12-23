import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import StatusHistoryService from '../services/statusHistory.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const statusHistoryService = new StatusHistoryService()

const getStatusHistories = async (
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

  const { statusHistories, totalCount } = await statusHistoryService.getAll({
    paginationData: {
      page,
      perPage,
      search,
      sortId,
      desc,
    },
    filters: {
      testGroupId: req.query.testGroupId as string,
    },
  })
  res.status(StatusCodes.OK).json({
    data: statusHistories,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createStatusHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await statusHistoryService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleStatusHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const statusHistory = await statusHistoryService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: statusHistory })
}

const updateStatusHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await statusHistoryService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteStatusHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await statusHistoryService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getStatusHistories,
  createStatusHistory,
  getSingleStatusHistory,
  updateStatusHistory,
  deleteStatusHistory,
}
