import { Request, Response } from 'express'
import { BadRequestError } from '../errors'
import * as fs from 'fs'
import { checkNumberParam } from '../utils/helper'
import DataOperationService from '../services/dataOperation.service'

const dataOperationService = new DataOperationService()

const exportApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filters = {
    status: req.query.status as string,
    provinceId: checkNumberParam(req.query.provinceId),
    districtId: checkNumberParam(req.query.districtId),
    municipalityId: checkNumberParam(req.query.municipalityId),
    wardId: checkNumberParam(req.query.wardId),
    startupSectorId: req.query.startupSectorId,
    attachment: req.query.attachment as string,
  }
  const { exportPath, fileName } =
    await dataOperationService.exportApplication(filters)
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

  res.sendFile(exportPath, (err) => {
    if (err) {
      throw new BadRequestError('Error downloading the file.')
    }
    // delete the temp file in exportPath
    fs.unlinkSync(exportPath)
  })
}

export { exportApplications }
