import { randomBytes } from 'crypto'

interface IPasswordOptions {
  length: number
  includeUppercase?: boolean
  includeNumbers?: boolean
  includeSymbols?: boolean
}

const defaultOptions: IPasswordOptions = {
  length: 12,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
}

const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMERIC_CHARS = '0123456789'
const SYMBOL_CHARS = '!@#$%^&*'

const generatePassword = (
  options: IPasswordOptions = defaultOptions
): string => {
  const { length, includeUppercase, includeNumbers, includeSymbols } = options
  let characters = LOWERCASE_CHARS
  if (includeUppercase) characters += UPPERCASE_CHARS
  if (includeNumbers) characters += NUMERIC_CHARS
  if (includeSymbols) characters += SYMBOL_CHARS

  const charactersLength = characters.length
  let password = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes(1)[0] % charactersLength
    password += characters[randomIndex]
  }

  return password
}

export default generatePassword
