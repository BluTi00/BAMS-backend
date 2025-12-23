import { Router } from 'express'

// Import all routers
import authRouter from './auth.routes'
import userRouter from './user.routes'
import mediaRouter from './media.routes'
import addressRouter from './address.routes'
import smsRouter from './sms.routes'
import applicationRouter from './application.routes'
import dashboardRouter from './dashboard.routes'
import applicationDownloadRouter from './applicationDownload.routes'
import analyticsRouter from './analytics.routes'
import reportRouter from './report.routes'
import applicationCycleRouter from './applicationCycle.routes'
import auditLogRouter from './auditLog.routes'
import applicationHistoryRouter from './applicationHistory.routes'
import statusHistoryRouter from './statusHistory.routes'
import resourceRouter from './resource.routes'
import bulkOperationLogRouter from './bulkOperationLog.routes'
import applicationBulkOpRouter from './applicationBulkOp.routes'

// Define a function to register all routes
const registerRoutes = (app: Router, apiRoute: string) => {
  app.use(apiRoute + '/auth', authRouter)
  app.use(apiRoute + '/user', userRouter)
  app.use(apiRoute + '/media', mediaRouter)
  app.use(apiRoute + '/address', addressRouter)
  app.use(apiRoute + '/sms', smsRouter)
  app.use(apiRoute + '/application', applicationRouter)
  app.use(apiRoute + '/dashboard', dashboardRouter)
  app.use(apiRoute + '/application-download', applicationDownloadRouter)
  app.use(apiRoute + '/analytics', analyticsRouter)
  app.use(apiRoute + '/report', reportRouter)
  app.use(apiRoute + '/application-cycle', applicationCycleRouter)
  app.use(apiRoute + '/audit-log', auditLogRouter)
  app.use(apiRoute + '/application-history', applicationHistoryRouter)
  app.use(apiRoute + '/status-history', statusHistoryRouter)
  app.use(apiRoute + '/resource', resourceRouter)
  app.use(apiRoute + '/bulk-operation-log', bulkOperationLogRouter)
  app.use(apiRoute + '/application-bulk-op', applicationBulkOpRouter)
}

export default registerRoutes
