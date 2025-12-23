import { StatusCodes } from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(err)
  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later',
  }
  if (err.name === 'PrismaClientValidationError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST
    defaultError.msg = 'Invalid Input Values'
  }

  if (err.code === 'P2002') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST
    defaultError.msg = 'Already exists!'
  }

  if (err.code === 'P2003') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST
    defaultError.msg = 'Cannot Delete, Already in Use!'
  }

  res.status(defaultError.statusCode).json({ msg: defaultError.msg })
}

export default errorHandlerMiddleware
