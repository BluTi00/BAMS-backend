import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import CodeCounterService from '../services/codeCounter.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const codeCounterService = new CodeCounterService()

const getCodeCounters = async (req: Request, res: Response): Promise<void> => {
  const { page, perPage, search } = validatePagination(
    req.query.currentPage as string,
    req.query.perPage as string,
    req.query.searchTerm as string
  )
  const { sortId, desc } = validateSorting(
    req.query.id as string,
    req.query.desc as string
  )

  const { codeCounters, totalCount } = await codeCounterService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: codeCounters,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getCodeCounterList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const codeCounters = await codeCounterService.getList()
  res.status(StatusCodes.OK).json({
    data: codeCounters,
  })
}

const createCodeCounter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await codeCounterService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleCodeCounter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const codeCounter = await codeCounterService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: codeCounter })
}

const updateCodeCounter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await codeCounterService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteCodeCounter = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await codeCounterService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getCodeCounters,
  createCodeCounter,
  getSingleCodeCounter,
  updateCodeCounter,
  deleteCodeCounter,
  getCodeCounterList,
}
