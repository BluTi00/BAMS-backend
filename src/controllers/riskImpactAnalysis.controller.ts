import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import RiskImpactAnalysisService from '../services/riskImpactAnalysis.service'
import { TokenData } from '../server'

const riskImpactAnalysisService = new RiskImpactAnalysisService()

const getSingleRiskImpactAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const riskImpactAnalysis = await riskImpactAnalysisService.getById(
    req.params.id
  )
  res.status(StatusCodes.OK).json({ data: riskImpactAnalysis })
}

const updateRiskImpactAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await riskImpactAnalysisService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteRiskImpactAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await riskImpactAnalysisService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getSingleRiskImpactAnalysis,
  updateRiskImpactAnalysis,
  deleteRiskImpactAnalysis,
}
