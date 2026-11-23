import { PrismaClient } from '@prisma/client'

function dbUrl() {
  const base = process.env.DATABASE_URL || ''
  if (base.includes('pool_timeout')) return base
  const sep = base.includes('?') ? '&' : '?'
  return base + sep + 'pool_timeout=30&connection_limit=5&connect_timeout=30'
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: dbUrl() } },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
