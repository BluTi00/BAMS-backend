import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import StartupSubSectorService from '../services/startupSubSector.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const startupSubSectorService = new StartupSubSectorService()

const getStartupSubSectors = async (
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
    startupSectorId: req.query.startupSectorId as string,
  }

  const { startupSubSectors, totalCount } =
    await startupSubSectorService.getAll({
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
    data: startupSubSectors,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getStartupSubSectorList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filters = {
    startupSectorId: req.query.startupSectorId as string,
  }

  const startupSubSectors = await startupSubSectorService.getList(filters)
  res.status(StatusCodes.OK).json({
    data: startupSubSectors,
  })
}

const createStartupSubSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await startupSubSectorService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleStartupSubSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startupSubSector = await startupSubSectorService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: startupSubSector })
}

const updateStartupSubSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await startupSubSectorService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteStartupSubSector = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await startupSubSectorService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getStartupSubSectors,
  createStartupSubSector,
  getSingleStartupSubSector,
  updateStartupSubSector,
  deleteStartupSubSector,
  getStartupSubSectorList,
}
