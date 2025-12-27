import { PROGRAM_TYPE, ROLE } from '../generated/client/client'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { db } from '../db/db.server'

export const hasPermission = (application: any, user?: TokenData) => {
  if (!user) return
  if (user.role === ROLE.USER && application.userId !== user.userId) {
    throw new BadRequestError(
      'You do not have permission for this application.'
    )
  }
  return
}

export const validateApplicationRequest = async ({
  user,
  applicationCycleId,
  programType,
}: {
  user: TokenData | undefined
  applicationCycleId: string
  programType: PROGRAM_TYPE
}) => {
  if (user?.role === ROLE.USER) {
    const applicationCycle = await db.applicationCycle.findUnique({
      where: {
        id: applicationCycleId,
      },
    })

    const today = new Date()
    const isFormOpen =
      today >= new Date(applicationCycle?.startDate as Date) &&
      today <= new Date(applicationCycle?.endDate as Date)

    if (!isFormOpen) {
      throw new BadRequestError('Application form is closed')
    }
  }

  const hasAlreadyApplied = await db.application.findFirst({
    where: {
      userId: user?.userId,
      applicationCycleId,
      deletedAt: null,
      programType,
    },
    include: {
      user: {
        select: {
          phone: true,
        },
      },
    },
  })

  if (hasAlreadyApplied) {
    throw new BadRequestError(
      `Application is already submitted by ${hasAlreadyApplied?.user?.phone}`
    )
  }
}
