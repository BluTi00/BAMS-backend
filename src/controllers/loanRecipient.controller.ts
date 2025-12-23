import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import LoanRecipientService from '../services/loanRecipient.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'

const loanRecipientService = new LoanRecipientService()

const getLoanRecipients = async (
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

  const { loanRecipients, totalCount } = await loanRecipientService.getAll({
    page,
    perPage,
    search,
    sortId,
    desc,
  })
  res.status(StatusCodes.OK).json({
    data: loanRecipients,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createLoanRecipient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await loanRecipientService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleLoanRecipient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const loanRecipient = await loanRecipientService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: loanRecipient })
}

const updateLoanRecipient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await loanRecipientService.update({
    data: req.body,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteLoanRecipient = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await loanRecipientService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getLoanRecipients,
  createLoanRecipient,
  getSingleLoanRecipient,
  updateLoanRecipient,
  deleteLoanRecipient,
}
