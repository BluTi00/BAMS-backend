import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import AssessmentService from '../services/assessment.service'
import { getPagingData, validatePagination } from '../utils/pagination'
import { validateSorting } from '../utils/validateSorting'
import { checkBooleanParam } from '../utils/helper'

const assessmentService = new AssessmentService()

const getAssessments = async (req: Request, res: Response): Promise<void> => {
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
    assessmentType: req.query.assessmentType as string,
    qualificationStatus: req.query.qualificationStatus as string,
  }

  const { assessments, totalCount } = await assessmentService.getAll({
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
    data: assessments,
    pagination: getPagingData(totalCount, page, perPage, search),
  })
}

const createAssessment = async (req: Request, res: Response): Promise<void> => {
  const message = await assessmentService.create(req.body, req.user)
  res.status(StatusCodes.OK).json({ msg: message })
}

const createAssessmentDraft = async (
  req: Request,
  res: Response
): Promise<void> => {
  const newAssessmentId = await assessmentService.createDraft(
    req.body,
    req.user
  )
  res.status(StatusCodes.OK).json({ msg: '', data: newAssessmentId })
}

const getSingleAssessment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const assessment = await assessmentService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: assessment })
}

const getAssessment = async (req: Request, res: Response): Promise<void> => {
  const assessment = await assessmentService.getOne({
    assessmentType: req.query.assessmentType as string,
    userId: req.user?.userId,
    isDraft: checkBooleanParam(req.query.isDraft),
  })
  res.status(StatusCodes.OK).json({ data: assessment })
}

const updateAssessment = async (req: Request, res: Response): Promise<void> => {
  const { isToastSilent, ...updateData } = req.body

  const message = await assessmentService.update({
    data: updateData,
    id: req.params.id,
  })
  res.status(StatusCodes.OK).json({ msg: isToastSilent ? '' : message })
}

const deleteAssessment = async (req: Request, res: Response): Promise<void> => {
  const message = await assessmentService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

const forwardAssessment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await assessmentService.forward(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getAssessments,
  createAssessment,
  getSingleAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessment,
  createAssessmentDraft,
  forwardAssessment,
}
