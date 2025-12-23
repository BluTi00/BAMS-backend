import express from 'express'
import { authenticateUser } from '../middleware/auth'
import uploadFile from '../utils/fileUpload'
import {
  createMedia,
  deleteMedia,
  downloadMedia,
} from '../controllers/media.controller'
const router = express.Router()

router.use(authenticateUser)
router.route('/').post(uploadFile.array('file'), createMedia)

router.route('/:id').get(downloadMedia).delete(authenticateUser, deleteMedia)
export default router
