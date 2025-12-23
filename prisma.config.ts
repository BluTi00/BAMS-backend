// prisma.config.ts (root level)
import 'dotenv/config' // Loads .env FIRST - critical for CLI
import { defineConfig, env } from 'prisma/config' // v7 official

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'), // env() throws if undefined; use process.env.DATABASE_URL as fallback if needed
  },
})
