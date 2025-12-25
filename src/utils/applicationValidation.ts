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
  userId,
  applicationCycleId,
  programType,
}: {
  userId: string
  applicationCycleId: string
  programType: PROGRAM_TYPE
}) => {
  const hasAlreadyApplied = await db.application.findFirst({
    where: {
      userId,
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
