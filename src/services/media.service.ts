import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { NotFoundError } from '../errors'
import { existsSync } from 'fs'
import path from 'path'
import { getTempFolderPath } from '../utils/path.utils'
import { MediaDto } from '../dto/media.dto'
import {
  transferImageFromTempTOUploadFolder,
  transferImageFromUploadTOTempFolder,
} from '../utils/media.utils'

class MediaService {
  async uploadFile(data: MediaDto): Promise<any> {
    if (!existsSync(path.join(getTempFolderPath(), data.name)))
      throw new NotFoundError('Sorry!, Media not found')

    const newMedia = await db.media.create({
      data: {
        name: data.name,
        mimeType: data.mimeType,
        mediaType: data.type,
      },
    })
    // Perform a file operation inside the transaction
    const fileUrl = transferImageFromTempTOUploadFolder(
      newMedia.id,
      data.name,
      data.type
    )
    await db.media.update({
      where: {
        id: newMedia.id,
      },
      data: {
        url: fileUrl,
      },
    })

    return newMedia

    // Transactional Operation
    // let fileOperationCompleted = false
    // let newMedia: any
    // try {
    // const  result = await db.$transaction(async () => {
    //     newMedia = await db.media.create({
    //       data: {
    //         name: data.name,
    //         mimeType: data.mimeType,
    //         mediaType: data.type,
    //       },
    //     })

    //     // Perform a file operation inside the transaction
    //     const fileUrl = transferImageFromTempTOUploadFolder(
    //       newMedia.id,
    //       data.name,
    //       data.type
    //     )
    //     fileOperationCompleted = true

    //     await db.media.update({
    //       where: {
    //         id: newMedia.id,
    //       },
    //       data: {
    //         url: fileUrl,
    //       },
    //     })

    //     return newMedia
    //   })

    //   return result
    // } catch (error) {
    //   if (fileOperationCompleted) {
    //     // Rollback the file operation if the transaction fails
    //     transferImageFromUploadTOTempFolder(newMedia.id, newMedia.name, newMedia.mediaType)
    //   }
    //   throw error
    // }
  }

  async delete(id: string): Promise<string> {
    const media = await db.media.findFirst({
      where: {
        id,
      },
    })

    if (media === null) throw new NotFoundError('Sorry!, Media not found')

    transferImageFromUploadTOTempFolder(
      media.id,
      media?.name as string,
      media.mediaType as string
    )

    await db.media.delete({
      where: {
        id,
      },
    })
    return messages.deleted('Media')
  }

  async getMediaById(id: string): Promise<any> {
    const media = await db.media.findFirst({
      where: {
        id,
      },
      select: {
        name: true,
        id: true,
        mediaType: true,
      },
    })

    if (media === null) throw new NotFoundError('Sorry!, Media not found')
    return media
  }
}

export default MediaService
