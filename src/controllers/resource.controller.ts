import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ResourceService from '../services/resource.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const resourceService = new ResourceService()

const getResources = async (req: Request, res: Response): Promise<void> => {
  const { page, perPage, search } = validatePagination(
    req.query.currentPage as string,
    req.query.perPage as string,
    req.query.searchTerm as string
  )
  const { sortId, desc } = validateSorting(
    req.query.id as string,
    req.query.desc as string
  )

  const { resources, totalCount } = await resourceService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: resources,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createResource = async (req: Request, res: Response): Promise<void> => {
  const message = await resourceService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleResource = async (
  req: Request,
  res: Response
): Promise<void> => {
  const resource = await resourceService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: resource })
}

const updateResource = async (req: Request, res: Response): Promise<void> => {
  const message = await resourceService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteResource = async (req: Request, res: Response): Promise<void> => {
  const message = await resourceService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

const downloadFileById = async (req: Request, res: Response): Promise<void> => {
  const { file, name, mimeType } = await resourceService.downloadById(
    req.params.id
  )
  res.setHeader('Content-Type', mimeType)
  res.setHeader('Content-Disposition', `inline; filename="${name}"`)
  res.send(file)
}

export {
  getResources,
  createResource,
  getSingleResource,
  updateResource,
  deleteResource,
  downloadFileById,
}
