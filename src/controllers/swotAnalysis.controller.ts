import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import SwotAnalysisService from '../services/swotAnalysis.service'
import { TokenData } from '../server'

const swotAnalysisService = new SwotAnalysisService()

const getSingleSwotAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const swotAnalysis = await swotAnalysisService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: swotAnalysis })
}

const updateSwotAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await swotAnalysisService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteSwotAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await swotAnalysisService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export { getSingleSwotAnalysis, updateSwotAnalysis, deleteSwotAnalysis }
