import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import FinancialAnalysisService from '../services/financialAnalysis.service'
import { TokenData } from '../server'

const financialAnalysisService = new FinancialAnalysisService()

const getSingleFinancialAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const financialAnalysis = await financialAnalysisService.getById(
    req.params.id
  )
  res.status(StatusCodes.OK).json({ data: financialAnalysis })
}

const updateFinancialAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await financialAnalysisService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteFinancialAnalysis = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await financialAnalysisService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  getSingleFinancialAnalysis,
  updateFinancialAnalysis,
  deleteFinancialAnalysis,
}
