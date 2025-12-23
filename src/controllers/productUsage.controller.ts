import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ProductUsageService from '../services/productUsage.service'
import { TokenData } from '../server'

const productUsageService = new ProductUsageService()

const getSingleProductUsage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productUsage = await productUsageService.getById(req.params.id)
  res.status(StatusCodes.OK).json({ data: productUsage })
}

const updateProductUsage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await productUsageService.update({
    data: req.body,
    applicationId: req.params.id,
    user: req.user as TokenData,
  })
  res.status(StatusCodes.OK).json({ msg: message })
}

const deleteProductUsage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const message = await productUsageService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export { getSingleProductUsage, updateProductUsage, deleteProductUsage }
