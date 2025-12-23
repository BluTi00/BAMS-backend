class CustomAPIError extends Error {
  statusCode: number = 200
  constructor(message: string) {
    super(message)
  }
}

export default CustomAPIError
