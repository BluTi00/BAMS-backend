import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import CommitteeService from '../services/committee.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const committeeService = new CommitteeService()

const getCommittees = async (req: Request, res: Response): Promise<void> => {
  const { page, perPage, search } = validatePagination(
    req.query.currentPage as string,
    req.query.perPage as string,
    req.query.searchTerm as string
  )
  const { sortId, desc } = validateSorting(
    req.query.id as string,
    req.query.desc as string
  )

  const { committees, totalCount } = await committeeService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: committees,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getCommitteeList = async (req: Request, res: Response): Promise<void> => {
  const committees = await committeeService.getList()
  res.status(StatusCodes.OK).json({
    data: committees,
  })
}

const createCommittee = async (req: Request, res: Response): Promise<void> => {
  const { newlyCreatedId, message } = await committeeService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message, newlyCreatedId })
}

const getSingleCommittee = async (
  req: Request,
  res: Response
): Promise<void> => {
  const committee = await committeeService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: committee })
}

const updateCommittee = async (req: Request, res: Response): Promise<void> => {
  const message = await committeeService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteCommittee = async (req: Request, res: Response): Promise<void> => {
  const message = await committeeService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getCommittees,
  createCommittee,
  getSingleCommittee,
  updateCommittee,
  deleteCommittee,
  getCommitteeList,
}
