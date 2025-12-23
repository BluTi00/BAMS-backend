import path from 'path'
import { Environment } from '../constants/enum'
import fs from 'fs'

/**
 * Get the path to the upload folder based on the current environment.
 *
 * In production, it returns an absolute path to the "public/uploads" folder.
 * In other environments, it returns a relative path to the "public/uploads" folder.
 *
 * @returns The path to the upload folder.
 */
export const getUploadFolderPath = (): string => {
  if (process.env.NODE_ENV === Environment.PRODUCTION)
    return path.resolve(process.cwd(), 'public', 'uploads')
  return path.join(__dirname, '..', '..', 'public', 'uploads')
}

/**
 * Get the path to the temporary folder based on the current environment.
 *
 * In production, it returns an absolute path to the "public/temp" folder.
 * In other environments, it returns a relative path to the "public/temp" folder.
 *
 * @returns The path to the temporary folder.
 */
export const getTempFolderPath = (): string => {
  const folderPath = path.join(process.cwd(), 'public', 'uploads', 'temp')
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  return folderPath
}

export const getTemplateFolderPath = (): string => {
  return path.resolve(process.cwd(), 'src', 'templates')
}
