import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ProjectIntroductionDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'

class ProjectIntroductionService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: ProjectIntroductionDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const {
      projectIntroduction,
      projectObjective,
      startupSectorId,
      startupSubSectorId,
      isProjectInPrioritySector,
    } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        projectIntroduction: true,
      },
    })

    if (!application) {
      throw new BadRequestError('Application not found.')
    }

    hasPermission(application, user)

    if (user?.role === ROLE.USER) {
      if (application.status !== APPLICATION_STATUS.INCOMPLETE) {
        throw new BadRequestError('Application Already Submitted.')
      }
    }
    if (application?.projectIntroduction) {
      // update projectIntroduction
      await db.projectIntroduction.update({
        where: {
          id: application.projectIntroduction.id,
        },
        data: {
          projectIntroduction,
          projectObjective,
          startupSectorId,
          isProjectInPrioritySector,
          startupSubSectorId,
        },
      })
    } else {
      // create new projectIntroduction
      await db.projectIntroduction.create({
        data: {
          projectIntroduction,
          projectObjective,
          startupSectorId,
          applicationId,
          startupSubSectorId,
          isProjectInPrioritySector,
        },
      })
    }

    return messages.updated('ProjectIntroduction')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const projectIntroduction = await db.projectIntroduction.findUnique({
      where: {
        applicationId,
      },
    })

    return projectIntroduction ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Project Introduction ID is required.')
    }

    const projectIntroduction = await db.projectIntroduction.findUnique({
      where: {
        id,
      },
    })

    if (!projectIntroduction) {
      throw new BadRequestError('Project Introduction not found.')
    }

    await db.projectIntroduction.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Project Introduction')
  }
}

export default ProjectIntroductionService
