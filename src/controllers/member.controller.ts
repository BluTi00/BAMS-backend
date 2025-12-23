import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import MemberService from '../services/member.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const memberService = new MemberService()

const getMembers = async (req: Request, res: Response): Promise<void> => {
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

  const { members, totalCount } = await memberService.getAll({
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
    data: members,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const getMemberList = async (req: Request, res: Response): Promise<void> => {
  const members = await memberService.getList()
  res.status(StatusCodes.OK).json({
    data: members,
  })
}

const createMember = async (req: Request, res: Response): Promise<void> => {
  const message = await memberService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleMember = async (req: Request, res: Response): Promise<void> => {
  const member = await memberService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: member })
}

const updateMember = async (req: Request, res: Response): Promise<void> => {
  const message = await memberService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteMember = async (req: Request, res: Response): Promise<void> => {
  const message = await memberService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getMembers,
  createMember,
  getSingleMember,
  updateMember,
  deleteMember,
  getMemberList,
}
