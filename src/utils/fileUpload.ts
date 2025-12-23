import multer from 'multer'
import fs from 'fs'
import path from 'path'
import Env from '../config/env.config'
import { Environment } from '../constants/enum'
import { BadRequestError } from '../errors'

// Define the maximum file size in bytes (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
// const MAX_FILE_SIZE = 5 * 1024 // 5KB

const storage = multer.diskStorage({
  destination: function (req: any, _file: any, cb: any) {
    let folderPath = ''

    if (!req.body.type)
      return cb(new BadRequestError('Please select file type.'), '')
    // if (!MediaType[req.body.type as keyof typeof MediaType])
    //   return cb(new BadRequestError('Invalid file type.'), '')

    if (Env.NODE_ENV === Environment.DEVELOPMENT)
      folderPath = path.join(process.cwd(), 'public', 'uploads', 'temp')
    else folderPath = path.resolve(process.cwd(), 'public', 'uploads', 'temp')

    !fs.existsSync(folderPath) && fs.mkdirSync(folderPath, { recursive: true })
    cb(null, folderPath)
  },

  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname) // Extract extension from the original file name

    // Fallback to a default extension if the MIME type is application/octet-stream
    if (file.mimetype === 'application/octet-stream' && !ext) {
      return cb(
        new BadRequestError(
          'File upload failed: Unable to determine file type.'
        ),
        ''
      )
    }

    const fileName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      // file.mimetype.split('/').pop()
      ext

    // console.log('fileName:', fileName)

    cb(null, fileName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
})
export default upload
