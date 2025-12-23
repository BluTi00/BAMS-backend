import { Prisma } from '../generated/client/client'

export const includeAddress: Prisma.AddressDefaultArgs = {
  include: {
    province: {
      select: {
        provinceTitle: true,
        provinceTitleNepali: true,
      },
    },
    district: {
      select: {
        districtTitle: true,
        districtTitleNepali: true,
      },
    },
    municipality: {
      select: {
        municipalityTitle: true,
        municipalityTitleNepali: true,
      },
    },
    ward: {
      select: {
        wardNumber: true,
        wardNumberNepali: true,
      },
    },
  },
}

export const includeMedia = {
  select: {
    id: true,
    url: true,
    mediaType: true,
    mimeType: true,
  },
}

// designations
const designations: any = [
  {
    value: 'CHAIRPERSON',
    label: {
      en: 'Chairperson',
      ne: 'अध्यक्ष',
    },
  },
  {
    value: 'VICE_CHAIRPERSON',
    label: {
      en: 'Vice Chairperson',
      ne: 'उपाध्यक्ष',
    },
  },
  {
    value: 'SECRETARY',
    label: {
      en: 'Secretary',
      ne: 'सचिव',
    },
  },
  {
    value: 'VICE_SECRETARY',
    label: {
      en: 'Vice Secretary',
      ne: 'उपसचिव',
    },
  },
  {
    value: 'TREASURER',
    label: {
      en: 'Treasurer',
      ne: 'कोषाध्यक्ष',
    },
  },
  {
    value: 'MEMBER',
    label: {
      en: 'Member',
      ne: 'सदस्य',
    },
  },
  {
    value: 'ADVISOR',
    label: {
      en: 'Advisor',
      ne: 'सल्लाहकार',
    },
  },
]

export const getDesignationOptions = (lang: string) => {
  return designations.map((item: any) => {
    return {
      value: item.value,
      label: item.label[lang],
    }
  })
}

export const getDesignationLabel = (designation: string, lang: string) => {
  const item = designations.find((item: any) => item.value === designation)
  return item ? item?.label[lang] : ''
}
