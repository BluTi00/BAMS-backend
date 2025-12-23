import { Prisma } from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { ResourceDto } from '../dto/resource.dto'
import { BadRequestError } from '../errors'
import { IPaginatedRequest } from '../interface/global.interface'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import { includeMedia } from '../constants/constant'
import { getUploadFolderPath } from '../utils/path.utils'

import MediaService from './media.service'
import { buildOrderBy } from '../utils/validateSorting'
const mediaService = new MediaService()

class ResourceService {
  async create(data: ResourceDto): Promise<string> {
    const { fileName, key } = data

    const newResource = await db.resource.create({
      data: {
        fileName,
        key,
      },
    })

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
              resource: {
                connect: {
                  id: newResource.id,
                },
              },
            },
          })
        })
      )
    }

    return messages.created('Resource')
  }

  async getAll({
    search,
    page,
    perPage,
    sortId,
    desc,
  }: IPaginatedRequest): Promise<any> {
    // Build the search condition
    const searchCondition: Prisma.ResourceWhereInput = search
      ? {
          OR: [
            {
              fileName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}

    // Get the count of records matching the search criteria
    const totalCount = await db.resource.count({
      where: searchCondition,
    })

    const resources = await db.resource.findMany({
      where: searchCondition,
      orderBy: buildOrderBy(sortId, desc),
      skip: (page - 1) * perPage,
      take: perPage,
    })

    return {
      totalCount,
      resources,
    }
  }

  async getById(id: string): Promise<any> {
    if (!id) {
      throw new BadRequestError('Resource ID is required.')
    }

    const resource = await db.resource.findFirst({
      where: {
        OR: [{ id }, { key: id }],
      },
      include: {
        media: includeMedia,
      },
    })

    return resource
  }

  async update({
    data,
    id,
  }: {
    data: ResourceDto
    id: string
  }): Promise<string> {
    const { fileName, key } = data

    if (!id) {
      throw new BadRequestError('Resource ID is required.')
    }

    const resource = await db.resource.findUnique({
      where: {
        id,
      },
    })

    if (!resource) {
      throw new BadRequestError('Resource not found.')
    }

    await db.resource.update({
      where: {
        id,
      },
      data: {
        fileName,
        key,
      },
    })

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
              resource: {
                connect: {
                  id: id,
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

    return messages.updated('Resource')
  }

  async delete(id: string): Promise<string> {
    if (!id) {
      throw new BadRequestError('Resource ID is required.')
    }

    const resource = await db.resource.findUnique({
      where: {
        id,
      },
      include: {
        media: true,
      },
    })

    if (!resource) {
      throw new BadRequestError('Resource not found.')
    }

    // delete media
    if (resource.media?.length > 0)
      await Promise.all(
        resource.media.map(async (element) => {
          await mediaService.delete(element.id)
        })
      )

    await db.resource.delete({
      where: {
        id,
      },
    })

    return messages.deleted('Resource')
  }

  async downloadById(resourceId: string): Promise<any> {
    if (!resourceId) {
      throw new BadRequestError('ID not found.')
    }

    const media = await db.media.findFirst({
      where: {
        resourceId,
      },
    })

    if (!media) {
      return null
    }

    const filePath = path.join(
      getUploadFolderPath(),
      'resource',
      media.id,
      media.name || ''
    )
    if (!fs.existsSync(filePath)) {
      throw new BadRequestError('File not found')
    }

    const file = fs.readFileSync(filePath)
    const mimeType = mime.lookup(media.name || '') || 'application/octet-stream'

    return {
      file,
      name: media.name || 'download',
      mimeType,
    }
  }
}

export default ResourceService
