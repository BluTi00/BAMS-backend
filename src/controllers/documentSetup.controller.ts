import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import DocumentSetupService from '../services/documentSetup.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const documentSetupService = new DocumentSetupService()

const getDocumentSetups = async (
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

  const { documentSetups, totalCount } = await documentSetupService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: documentSetups,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getDocumentSetupList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const documentSetups = await documentSetupService.getList()
  res.status(StatusCodes.OK).json({
    data: documentSetups,
  })
}

const createDocumentSetup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await documentSetupService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleDocumentSetup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const documentSetup = await documentSetupService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: documentSetup })
}

const updateDocumentSetup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await documentSetupService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteDocumentSetup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await documentSetupService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getDocumentSetups,
  createDocumentSetup,
  getSingleDocumentSetup,
  updateDocumentSetup,
  deleteDocumentSetup,
  getDocumentSetupList,
}
