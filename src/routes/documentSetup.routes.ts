import express from 'express'
import { validateDto } from '../middleware/validationMiddleware'
import { DocumentSetupDto } from '../dto/documentSetup.dto'
import {
  createDocumentSetup,
  deleteDocumentSetup,
  getDocumentSetupList,
  getDocumentSetups,
  getSingleDocumentSetup,
  updateDocumentSetup,
} from '../controllers/documentSetup.controller'
import { authenticateUser, authorization } from '../middleware/auth'
import { ROLE } from '../generated/client/client'
const router = express.Router()

router.route('/list').get(getDocumentSetupList)

router.use(
  authenticateUser,
  authorization([ROLE.SUPER_ADMIN, ROLE.SUDO_ADMIN, ROLE.ADMIN])
)
router
  .route('/')
  .get(getDocumentSetups)
  .post(validateDto(DocumentSetupDto), createDocumentSetup)

router
  .route('/:id')
  .get(getSingleDocumentSetup)
  .patch(validateDto(DocumentSetupDto), updateDocumentSetup)
  .delete(deleteDocumentSetup)

export default router
