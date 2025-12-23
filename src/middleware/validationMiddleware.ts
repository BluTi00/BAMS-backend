// validationMiddleware.ts

import { Request, Response, NextFunction } from 'express'
import { validate } from 'class-validator'

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = new dtoClass()
      Object.keys(req.body).forEach((key) => {
        dtoInstance[key] = req.body[key]
      })

      const validationErrors = await validate(dtoInstance)
      if (validationErrors.length > 0) {
        const errors = validationErrors.map((error) =>
          Object.values(error.constraints || 'something went wrong')
        )
        const msg = errors.join(', ')
        return res.status(400).json({ msg })
      }

      next()
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
