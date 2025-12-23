import { BadRequestError } from '../errors/index'
import { NextFunction, Request, Response } from 'express'
import { ROLE } from '../generated/client/client'
import ApplicationCycleService from '../services/applicationCycle.service'

const applicationCycleService = new ApplicationCycleService()

const validateApplicationCycle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { applicationCycle, isFormOpen } =
    await applicationCycleService.getLatest()

  req.applicationCycleId = applicationCycle.id

  if (
    [ROLE.SUDO_ADMIN, ROLE.SUPER_ADMIN, ROLE.ADMIN].includes(
      req.user.role as any
    )
  ) {
    return next()
  }

  if (!isFormOpen) {
    throw new BadRequestError('Application form is closed')
  }

  next()
}
export default validateApplicationCycle
