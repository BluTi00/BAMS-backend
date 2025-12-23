import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import AuditLogService from '../services/auditLog.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const auditLogService = new AuditLogService()

const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
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
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  }

  const { auditLogs, totalCount } = await auditLogService.getAll({
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
    data: auditLogs,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getSingleAuditLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const auditLog = await auditLogService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: auditLog })
}

const deleteAuditLog = async (req: Request, res: Response): Promise<void> => {
  const message = await auditLogService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export { getAuditLogs, getSingleAuditLog, deleteAuditLog }
