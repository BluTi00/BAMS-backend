import express from 'express'
import {
  getAllDistricts,
  getDistricts,
  getMunicipalities,
  getProvinces,
  getWards,
} from '../controllers/address.controller'
const router = express.Router()

router.get('/provinces', getProvinces)
router.get('/all-district', getAllDistricts)
router.get('/districts/:id', getDistricts)
router.get('/municipalities/:id', getMunicipalities)
router.get('/wards/:id', getWards)

export default router
