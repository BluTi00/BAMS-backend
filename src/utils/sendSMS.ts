export const sendSMS = async (phoneNumber: string, message: string) => {
  const token = 'v2_Ng2YgKiuOEi6SKhZPfeNOeKLQjL.oqsa'
  const from = 'TheAlert'
  // const from = 'Demo'

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
