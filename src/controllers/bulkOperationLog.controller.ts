import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import BulkOperationLogService from '../services/bulkOperationLog.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const bulkOperationLogService = new BulkOperationLogService()

const getBulkOperationLogs = async (
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
    operationType: req.query.operationType as string,
  }

  const { bulkOperationLogs, totalCount } =
    await bulkOperationLogService.getAll({
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
    data: bulkOperationLogs,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createBulkOperationLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await bulkOperationLogService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleBulkOperationLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const bulkOperationLog = await bulkOperationLogService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: bulkOperationLog })
}

const updateBulkOperationLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await bulkOperationLogService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteBulkOperationLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await bulkOperationLogService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

const reverseBulkOperation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await bulkOperationLogService.reverse(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getBulkOperationLogs,
  createBulkOperationLog,
  getSingleBulkOperationLog,
  updateBulkOperationLog,
  deleteBulkOperationLog,
  reverseBulkOperation,
}
