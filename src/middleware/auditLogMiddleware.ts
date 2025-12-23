import { Prisma } from '../generated/client/client'
import { getUserId, shouldSkipAudit } from './context'
import { db } from '../db/db.server'
import { isEqual } from 'lodash'

const sensitiveKeys = ['password', 'mPin']
const excludedKeys = ['reportContent', 'resultDraft']

export function auditLogMiddleware() {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    // Skip logging if the current context has skipAudit=true
    if (shouldSkipAudit()) {
      return next(params)
    }

    const allowedActions = ['create', 'update', 'delete']
    const includeModels = [
      'User',
      'Media',
      'ApplicationCycle',
      'Application',
      'EntrepreneurProfile',
      'ProductUsage',
      'ProjectIntroduction',
      'ProjectAnalysis',
      'RiskImpactAnalysis',
      'SwotAnalysis',
      'FinancialAnalysis',
      'WorkPlan',
      'Proposer',
      'StartupSector',
      'StartupSubSector',
      'DocumentSetup',
      'LoanRecipient',
    ]

    if (
      !allowedActions.includes(params.action) ||
      !includeModels.includes(params.model as string)
    ) {
      return next(params)
    }

    const start = Date.now()

    // Get the old record for update and delete actions
    let oldRecord: any = null
    const model = params.model as string
    const modelName = model.charAt(0).toLowerCase() + model.slice(1)
    const modelClient = (db as any)[modelName]
    if (
      (params.action === 'update' || params.action === 'delete') &&
      modelClient
    ) {
      oldRecord = await modelClient.findUnique({ where: params.args.where })
    }

    const result = await next(params)
    const duration = Date.now() - start

    const userId = getUserId()

    // if (!userId) {
    //   return result // skip logging if no user in context
    // }

    let changes: Record<string, any> | undefined

    if (params.action === 'create') {
      // changes = result // log initial values
      changes = {}

      for (const key in result) {
        if (sensitiveKeys.includes(key)) {
          changes[key] = { before: null, after: '****' }
        } else {
          changes[key] = { before: null, after: result[key] }
        }
      }
    } else if (params.action === 'update' && oldRecord) {
      changes = {}

      for (const key in params.args.data) {
        if (excludedKeys.includes(key)) {
          continue // skip excluded fields
        }

        if (sensitiveKeys.includes(key)) {
          changes[key] = { before: '****', after: '****' }
          continue // skip sensitive fields
        }

        const oldVal = oldRecord[key]
        const newVal = result[key]

        const hasChanged =
          typeof oldVal === 'object' && typeof newVal === 'object'
            ? !isEqual(oldVal, newVal)
            : oldVal !== newVal

        if (hasChanged) {
          changes[key] = { before: oldVal, after: newVal }
        }
      }

      if (Object.keys(changes).length === 0) changes = undefined // skip if nothing changed
    } else if (params.action === 'delete' && oldRecord) {
      // changes = oldRecord // log deleted values
      changes = {}

      for (const key in oldRecord) {
        if (sensitiveKeys.includes(key)) {
          changes[key] = { before: '****', after: null }
        } else {
          changes[key] = { before: oldRecord[key], after: null }
        }
      }
    }

    if (changes) {
      try {
        await db.auditLog.create({
          data: {
            model: params.model as string,
            recordId: String(result?.id ?? oldRecord?.id),
            action: params.action,
            userId: userId ? userId : null,
            changes,
            duration,
          },
        })
      } catch (err) {
        console.error('Audit log error:', err)
      }
    }

    return result
  }
}
