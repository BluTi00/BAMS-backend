import 'dotenv/config'
import { PrismaClient } from '../generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { auditLogExtension } from '../middleware/auditLogExtension'

// ----------
// Create base client (NO extensions here)
// ----------
function createBaseClient() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  })
}

// ----------
// Extend the client (Prisma 7 way)
// ----------
function createDb() {
  const base = createBaseClient()

  return base.$extends(
    auditLogExtension
    // future extensions go here
  )
}

// ----------
// Global singleton (dev-safe)
// ----------
type Db = ReturnType<typeof createDb>

declare global {
  var __db: Db | undefined
}

export const db: Db = global.__db ?? createDb()

if (process.env.NODE_ENV !== 'PRODUCTION') {
  global.__db = db
}
