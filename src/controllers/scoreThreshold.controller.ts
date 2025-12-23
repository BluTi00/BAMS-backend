import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ScoreThresholdService from '../services/scoreThreshold.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const scoreThresholdService = new ScoreThresholdService()

const getScoreThresholds = async (
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

  const { scoreThresholds, totalCount } = await scoreThresholdService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: scoreThresholds,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createScoreThreshold = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await scoreThresholdService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleScoreThreshold = async (
  req: Request,
  res: Response
): Promise<void> => {
  const scoreThreshold = await scoreThresholdService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: scoreThreshold })
}

const updateScoreThreshold = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await scoreThresholdService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteScoreThreshold = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await scoreThresholdService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getScoreThresholds,
  createScoreThreshold,
  getSingleScoreThreshold,
  updateScoreThreshold,
  deleteScoreThreshold,
}
