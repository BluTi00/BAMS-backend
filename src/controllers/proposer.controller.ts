import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ProposerService from '../services/proposer.service'
import { TokenData } from '../server'

const proposerService = new ProposerService()

const getSingleProposer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const proposer = await proposerService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: proposer })
}

const updateProposer = async (req: Request, res: Response): Promise<void> => {
  const message = await proposerService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteProposer = async (req: Request, res: Response): Promise<void> => {
  const message = await proposerService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export { getSingleProposer, updateProposer, deleteProposer }
