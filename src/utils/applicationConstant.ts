// innovative work
export const innovationOptions = [
  {
    value: 'SYSTEM_WIDE_INNOVATION',
    label: {
      en: 'Development of a new method in the overall system of existing product production or service delivery',
      ne: 'विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको समग्र प्रणालीमा नवीन पद्धतिको विकास',
    },
  },
  {
    value: 'SPECIFIC_AREA_INNOVATION',
    label: {
      en: 'Development of a new method in a specific area of existing product production or service delivery',
      ne: 'विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको खास क्षेत्रमा नवीन पद्धतिको विकास',
    },
  },
  {
    value: 'PROCESS_INNOVATION',
    label: {
      en: 'Development of a new method in a particular process of existing product production or service delivery',
      ne: 'विद्यमान वस्तु उत्पादन वा सेवा प्रवाहको कुनै प्रक्रियामा नवीन पद्धतिको विकास',
    },
  },
]

// productMarket
export const productMarketOptions = [
  {
    value: 'DOMESTIC_MARKET',
    label: {
      en: 'Domestic Market',
      ne: 'स्वदेशी बजार',
    },
  },
  {
    value: 'INTERNATIONAL_MARKET',
    label: {
      en: 'International Market',
      ne: 'अन्तर्राष्ट्रिय बजार',
    },
  },
  {
    value: 'BOTH_MARKETS',
    label: {
      en: 'Both Domestic and International Markets',
      ne: 'स्वदेशी तथा अन्तर्राष्ट्रिय दुवै बजार',
    },
  },
]

// material source
export const rawMaterialSourceOptions = [
  {
    value: 'FULLY_DOMESTIC',
    label: {
      en: 'Fully Domestic',
      ne: 'पूर्णरूपमा स्वदेशी',
    },
  },
  {
    value: 'FULLY_FOREIGN',
    label: {
      en: 'Fully Foreign',
      ne: 'पूर्णरूपमा वैदेशिक',
    },
  },
  {
    value: 'MOSTLY_DOMESTIC',
    label: {
      en: 'Mostly Domestic',
      ne: 'अधिकतम स्वदेशी',
    },
  },
  {
    value: 'MOSTLY_FOREIGN',
    label: {
      en: 'Mostly Foreign',
      ne: 'अधिकतम वैदेशिक',
    },
  },
]

// entrepreneurialExperience
export const entrepreneurialExperienceOptions = [
  {
    value: 'NO_EXPERIENCE',
    label: {
      en: 'No Experience',
      ne: 'अनुभव नभएको',
    },
  },
  {
    value: 'LESS_THAN_TWO_YEARS',
    label: {
      en: 'Less than Two Years of Experience',
      ne: 'दुई वर्षभन्दा कम अनुभव भएको',
    },
  },
  {
    value: 'TWO_YEARS_OR_MORE',
    label: {
      en: 'Two Years or More of Experience',
      ne: 'दुई वर्ष वा सोभन्दा बढीको अनुभव भएको',
    },
  },
]

// TODO
export const applicationStatusOptions = [
  {
    value: 'INCOMPLETE',
    label: {
      en: 'INCOMPLETE',
      ne: 'अधूरो',
    },
  },
  {
    value: 'REGISTERED',
    label: {
      en: 'REGISTERED',
      ne: 'दर्ता भयो',
    },
  },
  {
    value: 'APPROVED',
    label: {
      en: 'APPROVED',
      ne: 'स्वीकृत',
    },
  },
  {
    value: 'REJECTED',
    label: {
      en: 'REJECTED',
      ne: 'अस्वीकृत',
    },
  },
]

// technology adoption purpose
export const technologyAdoptionPurposeOptions = [
  {
    value: 'TO_KEEP_BUSINESS_ACCOUNTS',
    label: {
      en: 'To keep business accounts',
      ne: 'कारोबारको लेखाजोखा राख्न',
    },
  },

  {
    value: 'IN_PRODUCTION_PROCESS',
    label: {
      en: 'In the production process',
      ne: 'उत्पादनको प्रक्रियामा',
    },
  },

  {
    value: 'FULL_ADOPTION',
    label: {
      en: 'Full adoption',
      ne: 'पूर्ण अवलम्बन',
    },
  },
]

// land availability
export const landAvailabilityOptions = [
  {
    value: 'OWN_LAND',
    label: {
      en: 'Own Land',
      ne: 'आफ्नै स्वामित्वको',
    },
  },
  {
    value: 'RENTED_OR_LEASED_LAND',
    label: {
      en: 'Rented or Leased Land',
      ne: 'भाडा वा लिजमा',
    },
  },
]

// get nepali label for a given value through all the above options
export const getNepaliLabel = (value?: string | null): string => {
  if (!value) return ''

  const allOptions = [
    ...innovationOptions,
    ...productMarketOptions,
    ...rawMaterialSourceOptions,
    ...entrepreneurialExperienceOptions,
    ...applicationStatusOptions,
    ...technologyAdoptionPurposeOptions,
    ...landAvailabilityOptions,
  ]

  const option = allOptions.find((opt) => opt.value === value)

  return option ? option.label.ne : ''
}
