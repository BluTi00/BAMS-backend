import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ScreeningService from '../services/screening.service'

const screeningService = new ScreeningService()

const startScreeningProcess = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await screeningService.startProcess()
  res.status(StatusCodes.OK).json({ msg: message })
}

const screenSingleApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await screeningService.enqueueApplicationById(req.params.id)
  res.status(StatusCodes.OK).json({ data: result })
}

const getScreeningSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const summary = await screeningService.getSummary()
  res.status(StatusCodes.OK).json({ data: summary })
}

const pauseScreeningProcess = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await screeningService.pauseQueue()
  res.status(StatusCodes.OK).json({ msg: message })
}

const resumeScreeningProcess = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await screeningService.resumeQueue()
  res.status(StatusCodes.OK).json({ msg: message })
}

const clearScreeningQueue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await screeningService.clearQueue()
  res.status(StatusCodes.OK).json({ msg: message })
}

export {
  startScreeningProcess,
  screenSingleApplication,
  getScreeningSummary,
  pauseScreeningProcess,
  resumeScreeningProcess,
  clearScreeningQueue,
}
