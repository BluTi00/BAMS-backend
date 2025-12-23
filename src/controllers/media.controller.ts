import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import MediaService from '../services/media.service'
import { BadRequestError } from '../errors'
import { getUploadFolderPath } from '../utils/path.utils'
import path from 'path'

const mediaService = new MediaService()

const createMedia = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || req?.files?.length === 0) {
    throw new BadRequestError('No file to upload.')
  }

  const files = req.files as Express.Multer.File[]

  const data = files.map((file) => {
    return {
      name: file?.filename,
      mimeType: file?.mimetype,
      type: req.body?.type,
    }
  })

  res.status(StatusCodes.OK).json({ data })
}

// download media
const downloadMedia = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const media = await mediaService.getMediaById(id)

  if (!media) {
    throw new BadRequestError('Media not found.')
  }
  const { mediaType, id: mediaId, name } = media
  const filePath = path.join(
    getUploadFolderPath(),
    mediaType.toLowerCase(),
    mediaId.toString(),
    name
  )

  // Set the Content-Disposition header to attachment
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`)

  res.sendFile(filePath, (err) => {
    if (err) {
      throw new BadRequestError('Error downloading the file.')
    }
  })
}

const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  const message = await mediaService.delete(req.params.id)
  res.status(StatusCodes.OK).json({ msg: message })
}

export { createMedia, downloadMedia, deleteMedia }

// // Set the Content-Disposition header to attachment
// res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
