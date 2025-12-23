import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApplicationService from '../services/application.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'
import { TokenData } from '../server'
import { checkBooleanParam, checkNumberParam } from '../utils/helper'
import { BadRequestError } from '../errors'
import fs from 'fs'

const applicationService = new ApplicationService()

const getApplications = async (req: Request, res: Response): Promise<void> => {
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
    applicationCycleId: req.query.applicationCycleId as string,
    status: req.query.status as string,
    user: req?.user as TokenData,
    provinceId: checkNumberParam(req.query.provinceId),
    districtId: checkNumberParam(req.query.districtId),
    municipalityId: checkNumberParam(req.query.municipalityId),
    wardId: checkNumberParam(req.query.wardId),
    startupSectorId: req.query.startupSectorId,
    //
    attachment: req.query.attachment as string,
    includeDeleted: checkBooleanParam(req.query.includeDeleted),
    completedSteps: req.query.completedSteps as string,
  }

  const { applications, totalCount } = await applicationService.getAll({
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
    data: applications,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { createdApplicationId, message } = await applicationService.create(
    req.body,
    req?.user as any,
    req?.applicationCycleId as string
  )
  res.status(StatusCodes.OK).json({ msg: message, data: createdApplicationId })
}

const getApplication = async (req: Request, res: Response): Promise<void> => {
  const application = await applicationService.getOne({
    userId: req.user?.userId,
    applicationCycleId: req.query?.applicationCycleId as string,
  })
  res.status(StatusCodes.OK).json({ data: application })
}

const getSingleApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const application = await applicationService.getById({
    id: req.params.id,
    user: req.user,
  })
  res.status(StatusCodes.OK).json({ data: application })
}

const updateApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await applicationService.update({
    data: req.body,
    id: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await applicationService.updateStatus({
    id: req.params.id,
    data: req.body,
    userId: req.user?.userId as string,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await applicationService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

const exportApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { exportPath, fileName } = await applicationService.export(req.body)
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
  res.sendFile(exportPath, (err) => {
    if (err) {
      throw new BadRequestError('Error downloading the file.')
    }
    // delete the temp file in exportPath
    fs.unlinkSync(exportPath)
  })
}

export {
  getApplications,
  createApplication,
  getSingleApplication,
  deleteApplication,
  updateApplicationStatus,
  updateApplication,
  exportApplications,
  getApplication,
}
