import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ProjectAnalysisService from '../services/projectAnalysis.service'
import { TokenData } from '../server'

const projectAnalysisService = new ProjectAnalysisService()

const getSingleProjectAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const projectAnalysis = await projectAnalysisService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: projectAnalysis })
}

const updateProjectAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await projectAnalysisService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteProjectAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await projectAnalysisService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getSingleProjectAnalysis,
  updateProjectAnalysis,
  deleteProjectAnalysis,
}
