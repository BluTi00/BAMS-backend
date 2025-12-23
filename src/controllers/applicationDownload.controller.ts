import { Request, Response } from 'express'
import ApplicationDownloadService from '../services/applicationDownload.service'
import { checkBooleanParam } from '../utils/helper'
import { ROLE } from '../generated/client/client'

const applicationDownload = new ApplicationDownloadService()

const getSingleApplicationPdf = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pdf, fileName } = await applicationDownload.getPdfById({
    id: req.params.id,
    isUserRole: req.user?.role === ROLE.USER,
    includeAttachment: checkBooleanParam(req.query.includeAttachment),
  })

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Content-Length': pdf.length,
  })

  res.send(pdf)
}

export { getSingleApplicationPdf }
