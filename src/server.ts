import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import path from 'path'
// security packages
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
//middleware
import notFoundMiddleware from './middleware/not-found'
import errorHandlerMiddleware from './middleware/error-handler'
import registerRoutes from './routes'
import DotenvConfig from './config/env.config'

const app = express()

app.set('trust proxy', 1)
// Set security
app.use(helmet())

// Define a rate limit for API requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (15 minutes)
  message: 'Too many requests from this IP, please try again later',
})

export interface TokenData {
  userId: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user: TokenData
      applicationCycleId?: string
    }
  }
}

//middleware
app.use(limiter)
app.use(express.static(path.resolve(process.cwd(), 'public/uploads')))
app.use(
  cors({
    // origin: 'http://localhost:5173', // ✅ your frontend origin
    exposedHeaders: ['Content-Disposition'],
    origin: [DotenvConfig.CLIENT_URL], // Define specific domains allowed to interact with the API
    credentials: true, // ✅ allow cookies to be sent
  })
)

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// sitemap generator
// app.use('/sitemap.xml', sitemapRouter)

const port = process.env.PORT || 4000
const apiRoute = process.env.API_ROUTE || '/api/v1'
const serverName = process.env.SERVER_NAME || ''

// Use the centralized routes setup
registerRoutes(app, apiRoute)

// Error middlewares
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const start = async () => {
  try {
    // await startDatabase()
    app.listen(port, () => {
      console.log(`${serverName} Server is listening on port ${port}... `)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
