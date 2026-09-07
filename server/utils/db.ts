import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// One libSQL adapter covers both targets:
// dev → local file (DATABASE_URL=file:./dev.db), prod → Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
function createAdapter() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  if (tursoUrl) {
    return new PrismaLibSql({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN })
  }
  return new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' })
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
