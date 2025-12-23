// formatNumberWithNepaliCommas

export default function formatNepaliCurrency(
  value: number,
  lang: string = 'en'
): string {
  // Convert the number to a string and split it into integer and decimal parts
  const [integerPart, decimalPart] = value.toFixed(2).split('.')

  // Reverse the integer part to make it easier to place commas
  const reversedIntegerPart = integerPart.split('').reverse().join('')

  // Add commas every two digits, except the first three digits
  let formattedReversedIntegerPart = ''
  for (let i = 0; i < reversedIntegerPart.length; i++) {
    if (i > 2 && (i - 3) % 2 === 0) {
      formattedReversedIntegerPart += ','
    }
    formattedReversedIntegerPart += reversedIntegerPart[i]
  }

  // Reverse the integer part back to its original order
  const formattedIntegerPart = formattedReversedIntegerPart
    .split('')
    .reverse()
    .join('')

  // Combine the formatted integer part with the decimal part
  return `${formattedIntegerPart}${lang === 'en' ? '.' : '/'}${decimalPart}`
}
