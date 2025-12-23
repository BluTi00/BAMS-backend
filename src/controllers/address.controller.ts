import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import AddressService from '../services/address.service'

const addressService = new AddressService()

const getProvinces = async (req: Request, res: Response): Promise<void> => {
  const data = await addressService.getProvinces()
  res.status(StatusCodes.OK).json({
    data,
  })
}

const getDistricts = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  const data = await addressService.getDistricts(+id)
  res.status(StatusCodes.OK).json({
    data,
  })
}

const getMunicipalities = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id
  const data = await addressService.getMunicipalities(+id)
  res.status(StatusCodes.OK).json({
    data,
  })
}

const getWards = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id
  const data = await addressService.getWards(+id)
  res.status(StatusCodes.OK).json({
    data,
  })
}

const getAllDistricts = async (req: Request, res: Response): Promise<void> => {
  const data = await addressService.getAllDistrict()
  res.status(StatusCodes.OK).json({
    data,
  })
}

export {
  getProvinces,
  getDistricts,
  getMunicipalities,
  getWards,
  getAllDistricts,
}
