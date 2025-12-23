import fs from 'fs'
import path from 'path'
// import { MediaType } from '../constants/enum'

import { getTempFolderPath, getUploadFolderPath } from './path.utils'
import envConfig from '../config/env.config'
import { Environment } from '../constants/enum'
// import { MediaDto } from '../dto/media.dto'
// import MediaService from '../services/media.service'

// const mediaService = new MediaService()

export const transferImageFromTempTOUploadFolder = (
  id: string,
  name: string,
  type: string
): string => {
  // Define the path to the temporary folder where the image is currently stored.
  const TEMP_FOLDER_PATH = path.join(getTempFolderPath(), name)
  // Define the path to the target upload folder based on the image type and identifier.
  const UPLOAD_FOLDER_PATH = path.join(
    getUploadFolderPath(),
    type.toLowerCase(),
    id.toString()
  )
  // Create the target upload folder if it doesn't exist.
  !fs.existsSync(UPLOAD_FOLDER_PATH) &&
    fs.mkdirSync(UPLOAD_FOLDER_PATH, { recursive: true })
  // Move the image file from the temporary folder to the upload folder.
  fs.renameSync(TEMP_FOLDER_PATH, path.join(UPLOAD_FOLDER_PATH, name))

  return `${envConfig.BASE_URL}/${envConfig.NODE_ENV === Environment.DEVELOPMENT ? '' : 'media/'}${type.toLowerCase()}/${id}/${name}`
}

export const transferImageFromUploadTOTempFolder = (
  id: string,
  name: string,
  type: string
): void => {
  const UPLOAD_FOLDER_PATH = path.join(
    getUploadFolderPath(),
    type.toLowerCase(),
    id.toString()
  )

  const TEMP_FOLDER_PATH = path.join(getTempFolderPath(), name)

  if (!fs.existsSync(TEMP_FOLDER_PATH))
    fs.mkdirSync(TEMP_FOLDER_PATH, { recursive: true })

  const imageName = path.basename(name)
  try {
    fs.renameSync(
      path.join(UPLOAD_FOLDER_PATH, imageName),
      path.join(TEMP_FOLDER_PATH, imageName)
    )
    deleteFolder(UPLOAD_FOLDER_PATH)
  } catch (err) {
    console.log('🚀 ~ transferImageFromUploadTOTempFolder ~ err', err)
  }
}

// export const uploadAndSaveMedia = async (
//   mediaArray: MediaDto[],
//   propertyName: string,
//   entityName: any
// ) => {
//   if (mediaArray !== null && mediaArray?.length > 0) {
//     await Promise.all(
//       mediaArray.map(async (mediaData) => {
//         const media = await mediaService.uploadFile(mediaData)
//         media[propertyName] = entityName
//         await media.save()
//       })
//     )
//   }
// }

// export const deleteMedia = async (mediaArray: string[]) => {
//   if (mediaArray !== undefined && mediaArray?.length > 0) {
//     await Promise.all(
//       mediaArray.map(async (element) => {
//         await mediaService.delete(element)
//       })
//     )
//   }
// }

// delete empty folder
export const deleteFolder = (folderPath: string) => {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true })
  }
}
