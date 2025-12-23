import {
  Address,
  District,
  Municipality,
  Province,
  Ward,
} from '../generated/client/client'
import { messages } from '../constants/message'
import { db } from '../db/db.server'
import { BadRequestError, NotFoundError } from '../errors'
import { AddressDto } from '../dto/address.dto'

export interface IAddressValidationResponse {
  province: Province
  district: District
  municipality: Municipality
  ward: Ward
}

class AddressService {
  async getProvinces(): Promise<any[]> {
    const provinces = await db.province.findMany()

    const formattedProvinces = provinces.map((province) => ({
      value: province.id,
      label: {
        en: province.provinceTitle,
        ne: province.provinceTitleNepali,
      },
    }))
    return formattedProvinces
  }

  async getDistricts(provinceId: number): Promise<any[]> {
    const districts = await db.district.findMany({
      where: {
        provinceId: provinceId === 999 ? undefined : provinceId, // 999 is used for "All Provinces"
      },
    })

    const formattedDistricts = districts.map((district) => ({
      value: district.id,
      label: {
        en: district.districtTitle,
        ne: district.districtTitleNepali,
      },
    }))
    return formattedDistricts
  }

  async getDistrict(districtId: number): Promise<District> {
    const district = await db.district.findFirst({
      where: {
        id: districtId,
      },
    })

    if (!district) throw new NotFoundError(messages.notFound('District'))

    return district
  }

  async getMunicipalities(districtId: number): Promise<any[]> {
    const municipalities = await db.municipality.findMany({
      where: {
        districtId,
        // cbs_code: {
        //   lte: 70909,
        // },
      },
    })

    const formattedMunicipalities = municipalities.map((municipality) => ({
      value: municipality.id,
      label: {
        en: municipality.municipalityTitle,
        ne: municipality.municipalityTitleNepali,
      },
    }))

    return formattedMunicipalities
  }

  async getWards(municipalityId: number): Promise<any[]> {
    const wards = await db.ward.findMany({
      where: {
        municipalityId,
        wardNumber: {
          lte: 35,
          gt: 0,
        },
      },
    })

    const formattedWards = wards.map((ward) => ({
      value: ward.id,
      label: {
        en: ward.wardNumber,
        ne: ward.wardNumberNepali,
      },
    }))

    return formattedWards
  }

  async getWard(wardId: number): Promise<Ward> {
    const ward = await db.ward.findFirst({
      where: {
        id: wardId,
      },
    })

    if (!ward) throw new NotFoundError(messages.notFound('Ward'))

    return ward
  }

  async getAllDistrict(): Promise<District[]> {
    const districts = await db.district.findMany()
    return districts
  }

  async validate(data: AddressDto): Promise<null | IAddressValidationResponse> {
    const province = await db.province.findFirst({
      where: { id: data.provinceId },
    })

    if (!province) return null

    const district = await db.district.findFirst({
      where: { id: data.districtId },
    })

    if (!district) return null

    const municipality = await db.municipality.findFirst({
      where: { id: data.municipalityId },
    })

    if (!municipality) return null

    const ward = await db.ward.findFirst({
      where: { id: data.wardId },
    })

    if (!ward) return null

    return {
      province,
      district,
      municipality,
      ward,
    }
  }

  async create(data: AddressDto): Promise<Address> {
    const addressData = await this.validate(data)
    if (!addressData) throw new BadRequestError('Invalid address data')

    return await db.address.create({
      data: {
        provinceId: addressData.province.id,
        districtId: addressData.district.id,
        municipalityId: addressData.municipality.id,
        wardId: addressData.ward.id,
        locality: data.locality,
      },
    })
  }

  async update(id: string, data: AddressDto): Promise<Address> {
    const addressData = await this.validate(data)
    if (!addressData) throw new BadRequestError('Invalid address data')

    const address = await db.address.findFirst({
      where: {
        id: +id,
      },
    })

    if (!address) throw new NotFoundError(messages.notFound('Address'))

    return await db.address.update({
      where: {
        id: +id,
      },
      data: {
        provinceId: addressData.province.id,
        districtId: addressData.district.id,
        municipalityId: addressData.municipality.id,
        wardId: addressData.ward.id,
        locality: data.locality,
      },
    })
  }

  async delete(id: string): Promise<Address> {
    const address = await db.address.findFirst({
      where: {
        id: +id,
      },
    })

    if (!address) throw new NotFoundError(messages.notFound('Address'))

    return await db.address.delete({
      where: {
        id: +id,
      },
    })
  }
}

export default AddressService
