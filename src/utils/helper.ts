import bcrypt from 'bcryptjs'
import { IUser } from '../interface/global.interface'
import { BadRequestError } from '../errors'
import fs from 'fs'
import { ROLE } from '../generated/client/client'

export const hashPassword = async (plainPassword: string) => {
  const salt = await bcrypt.genSalt(10)
  const password = await bcrypt.hash(plainPassword, salt)
  return password
}

export const comparePassword = async (
  candidatePassword: string,
  password: string
) => {
  const isMatch = await bcrypt.compare(candidatePassword, password)
  return isMatch
}

// export const generatePassword = () => {
//   const password = generator.generate({
//     length: 10,
//     numbers: true,
//   })

//   return password
// }

export const compareResource = ({
  resource,
  user,
}: {
  resource: string | null
  user: IUser | undefined
}) => {
  if (!user || !resource) {
    throw new BadRequestError('User not found.')
  }

  if (user.role === ROLE.SUDO_ADMIN || user.role === ROLE.SUPER_ADMIN) return

  if (resource !== user.userId) {
    throw new BadRequestError('You are not authorized to perform this action.')
  }
}

// clean object
export const cleanObject = (obj: any) => {
  Object.keys(obj).forEach(
    (key) =>
      (obj[key] === undefined || obj[key] === null || obj[key] === '') &&
      delete obj[key]
  )
  return obj
}

// check if user is sudo user
export const isSudoUser = (role?: string) => {
  if (!role) return false
  return role === ROLE.SUDO_ADMIN
}

export const checkNumberParam = (param: any) => {
  if (
    param === undefined ||
    param === null ||
    param === '' ||
    param === 'null' ||
    param === 'undefined'
  ) {
    return null
  }
  return Number(param)
}

export const checkBooleanParam = (param: any) => {
  if (param === 'true') {
    return true
  }
  if (param === 'false') {
    return false
  }
  return false
}

// Function to read template file
export const readTemplate = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

// construct address
export const constructAddress = (
  address: any,
  lang: string,
  showFullAddress: boolean = false
) => {
  if (!address) return ''

  const province = address?.province?.provinceTitle
  const provinceNp = address?.province?.provinceTitleNepali
  const district = address?.district?.districtTitle
  const districtNp = address?.district?.districtTitleNepali
  const municipality = address?.municipality?.municipalityTitle
  const municipalityNp = address?.municipality?.municipalityTitleNepali
  const ward = address?.ward?.wardNumber
  const wardNp = address?.ward?.wardNumberNepali
  const locality = address?.locality

  const trimmedAddressEn = `${municipality} - ${ward}, ${district}`
  const trimmedAddressNp = `${municipalityNp} - ${wardNp}, ${districtNp}`

  const trimmedAddress = lang === 'en' ? trimmedAddressEn : trimmedAddressNp

  if (!showFullAddress) {
    return trimmedAddress
  }

  const fullAddressNp = `${provinceNp}, ${districtNp}, ${municipalityNp} - ${wardNp}, ${locality}`
  const fullAddressEn = `${province}, ${district}, ${municipality} - ${ward}, ${locality}`
  const fullAddress = lang === 'en' ? fullAddressEn : fullAddressNp
  return fullAddress
}

// arrange the members according to the designation
const designationOrder: any = {
  CHAIRPERSON: 1,
  VICE_CHAIRPERSON: 2,
  SECRETARY: 3,
  VICE_SECRETARY: 4,
  TREASURER: 5,
  MEMBER: 6,
  ADVISOR: 7,
}

export const arrangeMembers = (members: any) => {
  if (!members) return []
  const membersCopy = [...members]
  const sortedMembers = membersCopy.sort((a: any, b: any) => {
    return designationOrder[a.designation] - designationOrder[b.designation]
  })
  return sortedMembers
}

// construct address for export operation
export const constructExportAddress = (address: any, lang: string) => {
  if (!address) return ''
  const district = address?.district?.districtTitle
  const districtNp = address?.district?.districtTitleNepali
  const municipality = address?.municipality?.municipalityTitle
  const municipalityNp = address?.municipality?.municipalityTitleNepali
  const ward = address?.ward?.wardNumber?.toString().padStart(2, '0')
  const wardNp = address?.ward?.wardNumberNepali?.toString().padStart(2, '०')

  const addressEn = `${municipality} ${ward}, ${district}`
  const addressNp = `${municipalityNp} ${wardNp}, ${districtNp}`
  return lang === 'en' ? addressEn : addressNp
}

export const getDistrict = (address: any, lang: string) => {
  if (!address) return ''
  const district = address?.district?.districtTitle
  const districtNp = address?.district?.districtTitleNepali
  return lang === 'en' ? district : districtNp
}
