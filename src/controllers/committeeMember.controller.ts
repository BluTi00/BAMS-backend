import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import CommitteeMemberService from '../services/committeeMember.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const committeeMemberService = new CommitteeMemberService()

const getCommitteeMembers = async (
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
    committeeId: req.query.committeeId as string,
  }

  const { committeeMembers, totalCount } = await committeeMemberService.getAll({
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
    data: committeeMembers,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createCommitteeMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await committeeMemberService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleCommitteeMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const committeeMember = await committeeMemberService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: committeeMember })
}

const updateCommitteeMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await committeeMemberService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteCommitteeMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await committeeMemberService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getCommitteeMembers,
  createCommitteeMember,
  getSingleCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
}
