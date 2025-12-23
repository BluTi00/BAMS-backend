// context.ts
import { AsyncLocalStorage } from 'node:async_hooks'

interface RequestContext {
  userId?: string
  skipAudit?: boolean
  // add more flags here in future, e.g. skipNotifications?: boolean
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

export const runWithContext = async (
  context: RequestContext,
  fn: () => Promise<any>
) => {
  return asyncLocalStorage.run(context, fn)
}

export const getUserId = (): string | undefined => {
  return asyncLocalStorage.getStore()?.userId
}

export const shouldSkipAudit = (): boolean => {
  return asyncLocalStorage.getStore()?.skipAudit ?? false
}

//
// Helpers
//

// ✅ feature-specific helper
export const withSkipAudit = async <T>(fn: () => Promise<T>): Promise<T> => {
  const current = asyncLocalStorage.getStore() || {}
  return asyncLocalStorage.run({ ...current, skipAudit: true }, fn)
}

// ✅ generic future-proof helper
export const withContextPatch = async <T>(
  patch: Partial<RequestContext>,
  fn: () => Promise<T>
): Promise<T> => {
  const current = asyncLocalStorage.getStore() || {}
  return asyncLocalStorage.run({ ...current, ...patch }, fn)
}

// How to use in a function

// await withSkipAudit(async () => {
//   await bulkUploadStuff()
// })

// could also do in future:
// await withContextPatch({ skipAudit: true, skipNotifications: true }, async () => {
//   await importDataWithoutNoise()
// })
