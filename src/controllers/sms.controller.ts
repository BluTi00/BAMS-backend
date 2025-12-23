import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'
import SMSService from '../services/sms.service'

const sMSService = new SMSService()

const getSMSs = async (req: Request, res: Response): Promise<void> => {
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
    messageType: req.query.messageType as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  }

  const { sMSs, totalCount } = await sMSService.getAll({
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
    data: sMSs,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createSMS = async (req: Request, res: Response): Promise<void> => {
  const message = await sMSService.create(req.body)
  res.status(StatusCodes.OK).json({ msg: message })
}

const getSingleSMS = async (req: Request, res: Response): Promise<void> => {
  const sMS = await sMSService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: sMS })
}

const resendSMS = async (req: Request, res: Response): Promise<void> => {
  const message = await sMSService.resend(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteSMS = async (req: Request, res: Response): Promise<void> => {
  const message = await sMSService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export { getSMSs, createSMS, getSingleSMS, resendSMS, deleteSMS }
