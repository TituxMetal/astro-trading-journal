import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const options: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(options)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
