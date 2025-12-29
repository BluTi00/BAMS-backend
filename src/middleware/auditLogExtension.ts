import { Prisma } from '../generated/client/client'
import { isEqual } from 'lodash'
import { getUserId, shouldSkipAudit } from './context'
import { auditClient } from './auditClient'

const sensitiveKeys = ['password', 'mPin']
const excludedKeys = ['reportContent', 'resultDraft']

const includeModels = new Set([
  'User',
  'Media',
  'ApplicationCycle',
  'Application',
])

export const auditLogExtension = Prisma.defineExtension({
  name: 'auditLog',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // 1️⃣ Fast exits
        // if (!model) return query(args)

        if (shouldSkipAudit()) return query(args)
        if (!['create', 'update', 'delete'].includes(operation)) {
          return query(args)
        }
        if (!includeModels.has(model)) {
          return query(args)
        }

        const userId = getUserId()
        // if (!userId) {
        //   return query(args)
        // }

        const start = Date.now()

        // 2️⃣ ALWAYS fetch old record via BASE client
        let oldRecord: any = null

        if (operation === 'update' || operation === 'delete') {
          const modelName = model.charAt(0).toLowerCase() + model.slice(1)

          const baseModel = (auditClient as any)[modelName]

          if (baseModel?.findUnique && (args as any)?.where) {
            oldRecord = await baseModel.findUnique({
              where: (args as any).where,
            })
          }
        }

        // 3️⃣ Execute the actual query
        const result: any = await query(args)
        const duration = Date.now() - start

        // 4️⃣ Build audit payload
        let changes: any

        // CREATE
        if (operation === 'create') {
          changes = {}

          for (const key in result) {
            if (sensitiveKeys.includes(key)) {
              changes[key] = { before: null, after: '****' }
            } else {
              changes[key] = { before: null, after: result[key] }
            }
          }
        }

        // UPDATE
        else if (operation === 'update' && oldRecord) {
          changes = {}
          const data = (args as any).data ?? {}

          for (const key of Object.keys(data)) {
            if (excludedKeys.includes(key)) continue

            if (sensitiveKeys.includes(key)) {
              changes[key] = { before: '****', after: '****' }
              continue
            }

            const before = oldRecord[key]
            const after = (result as any)[key]

            const changed =
              typeof before === 'object' && typeof after === 'object'
                ? !isEqual(before, after)
                : before !== after

            if (changed) {
              changes[key] = { before, after }
            }
          }

          if (Object.keys(changes).length === 0) {
            changes = undefined
          }
        }

        // DELETE
        else if (operation === 'delete' && oldRecord) {
          // changes = oldRecord
          changes = {}

          for (const key in oldRecord) {
            if (sensitiveKeys.includes(key)) {
              changes[key] = { before: '****', after: null }
            } else {
              changes[key] = { before: oldRecord[key], after: null }
            }
          }
        }

        // 5️⃣ Persist audit log (BASE client)
        if (changes) {
          await auditClient.auditLog.create({
            data: {
              model,
              recordId: String((result as any)?.id ?? oldRecord?.id),
              action: operation,
              userId: userId ? userId : null,
              changes,
              duration,
            },
          })
        }

        return result
      },
    },
  },
})
