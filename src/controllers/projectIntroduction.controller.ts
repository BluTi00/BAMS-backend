import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ProjectIntroductionService from '../services/projectIntroduction.service'
import { TokenData } from '../server'

const projectIntroductionService = new ProjectIntroductionService()

const getSingleProjectIntroduction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const projectIntroduction = await projectIntroductionService.getById(
    req.params.id
  )
  res.status(StatusCodes.OK).json({ data: projectIntroduction })
}

const updateProjectIntroduction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await projectIntroductionService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteProjectIntroduction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await projectIntroductionService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getSingleProjectIntroduction,
  updateProjectIntroduction,
  deleteProjectIntroduction,
}
