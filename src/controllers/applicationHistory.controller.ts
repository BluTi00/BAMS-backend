import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApplicationHistoryService from '../services/applicationHistory.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const applicationHistoryService = new ApplicationHistoryService()

const getApplicationHistories = async (
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

  const filters = {
    userId: req.user.userId as string,
  }

  const { applicationHistories, totalCount } =
    await applicationHistoryService.getAll({
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
    data: applicationHistories,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getSingleApplicationHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const applicationHistory = await applicationHistoryService.getById(
    req.params.id,
    req.user
  )
  res.status(StatusCodes.OK).json({ data: applicationHistory })
}

export { getApplicationHistories, getSingleApplicationHistory }
