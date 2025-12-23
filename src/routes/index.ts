import { Router } from 'express'

// Import all routers
import authRouter from './auth.routes'
import userRouter from './user.routes'
import mediaRouter from './media.routes'
import addressRouter from './address.routes'
import smsRouter from './sms.routes'
import applicationRouter from './application.routes'
import entrepreneurProfileRouter from './entrepreneurProfile.routes'
import projectIntroductionRouter from './projectIntroduction.routes'
import startupSectorRouter from './startupSector.routes'
import projectAnalysisRouter from './projectAnalysis.routes'
import riskImpactAnalysisRouter from './riskImpactAnalysis.routes'
import swotAnalysisRouter from './swotAnalysis.routes'
import dashboardRouter from './dashboard.routes'
import applicationDownloadRouter from './applicationDownload.routes'
import analyticsRouter from './analytics.routes'
import reportRouter from './report.routes'
import dataOperationRouter from './dataOperation.routes'
import applicationCycleRouter from './applicationCycle.routes'
import auditLogRouter from './auditLog.routes'
import applicationHistoryRouter from './applicationHistory.routes'
import productUsageRouter from './productUsage.routes'
import wokPlanRouter from './workPlan.routes'
import financialAnalysisRouter from './financialAnalysis.routes'
import documentSetupRouter from './documentSetup.routes'
import statusHistoryRouter from './statusHistory.routes'
import startupSubSectorRouter from './startupSubSector.routes'
import proposerRouter from './proposer.routes'
import loanRecipientBulkOpRouter from './loanRecipientBulkOp.routes'
import resourceRouter from './resource.routes'
import loanRecipientRouter from './loanRecipient.routes'
import committeeRouter from './committee.routes'
import memberRouter from './member.routes'
import committeeMemberRouter from './committeeMember.routes'
import assessmentRouter from './assessment.routes'
import scoreThresholdRouter from './scoreThreshold.routes'
import screeningRouter from './screening.routes'
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
  app.use(apiRoute + '/entrepreneur-profile', entrepreneurProfileRouter)
  app.use(apiRoute + '/project-introduction', projectIntroductionRouter)
  app.use(apiRoute + '/startup-sector', startupSectorRouter)
  app.use(apiRoute + '/project-analysis', projectAnalysisRouter)
  app.use(apiRoute + '/risk-impact-analysis', riskImpactAnalysisRouter)
  app.use(apiRoute + '/swot-analysis', swotAnalysisRouter)
  app.use(apiRoute + '/dashboard', dashboardRouter)
  app.use(apiRoute + '/application-download', applicationDownloadRouter)
  app.use(apiRoute + '/analytics', analyticsRouter)
  app.use(apiRoute + '/report', reportRouter)
  app.use(apiRoute + '/data-operation', dataOperationRouter)
  app.use(apiRoute + '/application-cycle', applicationCycleRouter)
  app.use(apiRoute + '/audit-log', auditLogRouter)
  app.use(apiRoute + '/application-history', applicationHistoryRouter)
  app.use(apiRoute + '/product-usage', productUsageRouter)
  app.use(apiRoute + '/work-plan', wokPlanRouter)
  app.use(apiRoute + '/financial-analysis', financialAnalysisRouter)
  app.use(apiRoute + '/document-setup', documentSetupRouter)
  app.use(apiRoute + '/status-history', statusHistoryRouter)
  app.use(apiRoute + '/startup-sub-sector', startupSubSectorRouter)
  app.use(apiRoute + '/proposer', proposerRouter)
  app.use(apiRoute + '/resource', resourceRouter)
  app.use(apiRoute + '/loan-recipient', loanRecipientRouter)
  app.use(apiRoute + '/committee', committeeRouter)
  app.use(apiRoute + '/member', memberRouter)
  app.use(apiRoute + '/committee-member', committeeMemberRouter)
  app.use(apiRoute + '/assessment', assessmentRouter)
  app.use(apiRoute + '/score-threshold', scoreThresholdRouter)
  app.use(apiRoute + '/screenings', screeningRouter)
  app.use(apiRoute + '/bulk-operation-log', bulkOperationLogRouter)
  app.use(apiRoute + '/loan-recipient-bulk-op', loanRecipientBulkOpRouter)
  app.use(apiRoute + '/application-bulk-op', applicationBulkOpRouter)
}

export default registerRoutes
