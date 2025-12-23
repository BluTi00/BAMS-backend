import CustomAPIError from "./custom-api"
import { StatusCodes } from "http-status-codes"

class UnauthenticatedError extends CustomAPIError {
  constructor(message: string) {
    super(message)
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}

export default UnauthenticatedError
