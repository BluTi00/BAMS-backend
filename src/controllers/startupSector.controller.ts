import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import StartupSectorService from '../services/startupSector.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const startupSectorService = new StartupSectorService()

const getStartupSectors = async (
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

  const { startupSectors, totalCount } = await startupSectorService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: startupSectors,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getStartupSectorList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startupSectors = await startupSectorService.getList()
  res.status(StatusCodes.OK).json({
    data: startupSectors,
  })
}

const createStartupSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await startupSectorService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleStartupSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startupSector = await startupSectorService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: startupSector })
}

const updateStartupSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await startupSectorService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteStartupSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await startupSectorService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getStartupSectors,
  createStartupSector,
  getSingleStartupSector,
  updateStartupSector,
  deleteStartupSector,
  getStartupSectorList,
}
