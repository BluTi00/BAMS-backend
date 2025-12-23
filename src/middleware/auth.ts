import { UnauthenticatedError, UnauthorizedError } from '../errors/index'
import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { messages } from '../constants/message'
import { ROLE } from '../generated/client/client'
import { asyncLocalStorage } from './context'

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1️⃣ Read token from cookie
    const token = req.cookies?.access_token
    if (!token) {
      throw new UnauthenticatedError('Authentication Invalid')
    }

    // 2️⃣ Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload

    if (!payload.userId || !payload.role) {
      throw new UnauthenticatedError('Authentication Invalid')
    }

    // 3️⃣ Attach user info to request
    req.user = {
      userId: payload.userId,
      role: payload.role,
    }

    // 4️⃣ Optionally wrap in AsyncLocalStorage context
    asyncLocalStorage.run({ userId: payload.userId }, () => {
      next()
    })
  } catch (error) {
    throw new UnauthenticatedError('Authentication Invalid')
  }
}

const authorization = (roles: ROLE[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError(messages.notAuthorized)
    }
    try {
      const userRole = req?.user?.role
      if (userRole && roles.includes(userRole as ROLE)) {
        next()
      } else {
        throw new UnauthenticatedError(messages.notAuthorized)
      }
    } catch (err: any) {
      throw new UnauthorizedError(messages.notAuthorized)
    }
  }
}

export { authenticateUser, authorization }
