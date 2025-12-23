import { APPLICATION_STATUS, ROLE } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ProposerDto } from '../dto/application.dto'
import { BadRequestError } from '../errors'
import { TokenData } from '../server'
import { hasPermission } from '../utils/applicationValidation'
import MediaService from './media.service'
import { includeMedia } from '../constants/constant'

const mediaService = new MediaService()

class ProposerService {
  async update({
    data,
    applicationId,
    user,
  }: {
    data: ProposerDto
    applicationId: string
    user: TokenData
  }): Promise<any> {
    const { name, proposedDate, phone, email } = data

    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        proposer: true,
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

    let proposerId = application.proposer?.id || null

    if (application?.proposer) {
      // update proposer
      await db.proposer.update({
        where: {
          id: application.proposer.id,
        },
        data: {
          name,
          proposedDate,
          phone,
          email,
        },
      })
    } else {
      // create new proposer
      const newProposer = await db.proposer.create({
        data: {
          name,
          proposedDate,
          phone,
          email,
          application: {
            connect: {
              id: applicationId,
            },
          },
        },
      })
      proposerId = newProposer.id
    }

    if (!proposerId) {
      throw new BadRequestError('Proposer ID not found.')
    }

    // create media
    if (data?.media !== null && data?.media?.length > 0) {
      await Promise.all(
        data?.media.map(async (mediaData) => {
          const media = await mediaService.uploadFile(mediaData)
          await db.media.update({
            where: {
              id: media.id,
            },
            data: {
              proposer: {
                connect: {
                  id: proposerId,
                },
              },
            },
          })
        })
      )
    }

    // delete media
    if (data?.deletedMedia !== null && data?.deletedMedia?.length > 0) {
      await Promise.all(
        data?.deletedMedia.map(async (mediaId) => {
          await mediaService.delete(mediaId)
        })
      )
    }

    return messages.updated('Proposer')
  }

  async getById(applicationId: string): Promise<any> {
    if (!applicationId) {
      throw new BadRequestError('Application ID is required.')
    }

    const proposer = await db.proposer.findUnique({
      where: {
        applicationId,
      },
      include: {
        media: includeMedia,
      },
    })

    return proposer ?? null
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Proposer ID is required.')
    }

    const proposer = await db.proposer.findUnique({
      where: {
        id,
      },
      include: {
        media: true,
      },
    })

    if (!proposer) {
      throw new BadRequestError('Proposer not found.')
    }

    // delete media
    if (proposer.media?.length > 0)
      await Promise.all(
        proposer.media.map(async (element) => {
          await mediaService.delete(element.id)
        })
      )

    await db.proposer.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Proposer')
  }
}

export default ProposerService
