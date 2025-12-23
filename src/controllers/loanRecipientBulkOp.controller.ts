import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import LoanRecipientBulkOpService from '../services/loanRecipientBulkOp.service'

const loanRecipientBulkOpService = new LoanRecipientBulkOpService()

const bulkUploadLoanRecipients = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await loanRecipientBulkOpService.bulkUpload(
    req.body,
    req.user as any
  )
  res.status(StatusCodes.OK).json({ msg: message })
}

export { bulkUploadLoanRecipients }
