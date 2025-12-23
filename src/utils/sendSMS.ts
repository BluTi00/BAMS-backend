import { BadRequestError } from '../errors'

export const sendSMS = async (phoneNumber: string, message: string) => {
  const token = process.env.SMS_TOKEN
  const from = 'TheAlert'
  // const from = 'Demo'

  if (!token) {
    throw new BadRequestError(
      'SMS token is not configured. Please set SMS_TOKEN in environment variables.'
    )
  }

  const values = {
    token,
    from,
    to: phoneNumber,
    text: message,
  }

  const res = await fetch('http://api.sparrowsms.com/v2/sms/', {
    method: 'POST',
    body: JSON.stringify(values),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const responseString = await res.text()

  return responseString
}
