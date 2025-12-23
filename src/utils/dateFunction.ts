import dayjs from 'dayjs'
import NepaliDate from 'nepali-datetime'

export const ADToBS = (adDate: Date | string) => {
  const date = dayjs(adDate)
  if (!date.isValid()) return ''

  const year = date.year()
  if (year < 1945 || year > 2043) return '' // safe range check

  try {
    return new NepaliDate(date.toDate()).format('YYYY-MM-DD')
  } catch {
    return ''
  }
}

export const BSToAD = (
  bsDate: string | undefined,
  returnJsDate = false
): Date | string => {
  if (!bsDate) return ''

  try {
    const adDate = new NepaliDate(bsDate)
    return returnJsDate ? adDate?.getDateObject() : adDate.format('YYYY-MM-DD')
  } catch {
    return ''
  }
}

export const getFormattedDateInAD = (date?: string | Date): string => {
  const d = dayjs(date)
  return d.isValid() ? d.format('YYYY-MM-DD') : ''
}
