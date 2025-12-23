type LabelType = Record<string, Record<string, string>>

const labels: LabelType = {
  0: {
    en: '0',
    ne: '०',
  },
  1: {
    en: '1',
    ne: '१',
  },
  2: {
    en: '2',
    ne: '२',
  },
  3: {
    en: '3',
    ne: '३',
  },
  4: {
    en: '4',
    ne: '४',
  },
  5: {
    en: '5',
    ne: '५',
  },
  6: {
    en: '6',
    ne: '६',
  },
  7: {
    en: '7',
    ne: '७',
  },
  8: {
    en: '8',
    ne: '८',
  },
  9: {
    en: '9',
    ne: '९',
  },
}
export default labels

export function digitConverter(number: number): Record<string, string> | null {
  if (!number) return labels['0']
  const numberString = number?.toString()
  const generatedLabels: Record<string, string> = {}

  if (number >= 1 && number <= 9) {
    const singleDigitLabels = labels['0']
    if (!singleDigitLabels) return null

    Object.keys(singleDigitLabels).forEach((language) => {
      generatedLabels[language] = singleDigitLabels[language]
    })
  }

  for (let i = 0; i < numberString?.length; i++) {
    const digit = numberString[i]
    const digitLabels = labels[digit]

    if (!digitLabels) return null // Return null if any digit does not have labels defined

    Object.keys(digitLabels).forEach((language) => {
      generatedLabels[language] = generatedLabels[language] || ''
      generatedLabels[language] += digitLabels[language]
    })
  }

  return generatedLabels
}

export function convertText(
  text: string | number | null | undefined,
  lang: string
): string {
  if (!text && text !== 0) return ''
  if (text === 0) return labels['0'][lang]
  const str = text?.toString()
  let devanagariStr = ''

  for (let i = 0; i < str?.length; i++) {
    const digit = str[i]

    if (labels[digit]?.[lang]) devanagariStr += labels[digit][lang]
    else devanagariStr += digit
  }

  return devanagariStr
}

// get nepali alphabet for given index
export function getNepaliAlphabet(index: number): string {
  const nepaliAlphabets = [
    'क',
    'ख',
    'ग',
    'घ',
    'ङ',
    'च',
    'छ',
    'ज',
    'झ',
    'ञ',
    'ट',
    'ठ',
    'ड',
    'ढ',
    'ण',
    'त',
    'थ',
    'द',
    'ध',
    'न',
    'प',
    'फ',
    'ब',
    'भ',
    'म',
    'य',
    'र',
    'ल',
    'व',
    'श',
    'ष',
    'स',
    'ह',
  ]

  if (index < 0) {
    return ''
  }

  if (index <= nepaliAlphabets.length) {
    return nepaliAlphabets[index]
  }

  // else combine alphabets like: कक, कख, कग, ...
  const firstIndex = Math.floor(index / nepaliAlphabets.length) - 1
  const secondIndex = index % nepaliAlphabets.length

  return nepaliAlphabets[firstIndex] + nepaliAlphabets[secondIndex]
}
