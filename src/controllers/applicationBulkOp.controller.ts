import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApplicationBulkOpService from '../services/applicationBulkOp.service'

const applicationBulkOpService = new ApplicationBulkOpService()

const bulkUploadApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  // respond immediately
  res.status(StatusCodes.ACCEPTED).json({
    msg: 'Bulk upload started. You will be notified once it completes.',
  })

  // run in background
  setImmediate(async () => {
    try {
      await applicationBulkOpService.bulkUpload(req.body, req.user as any)
    } catch (err) {
      console.error('Bulk upload failed:', err)
      // log failure / update DB status
    }
  })
}

export { bulkUploadApplications }
