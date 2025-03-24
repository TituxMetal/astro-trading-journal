import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { Lucia, TimeSpan } from 'lucia'
import { prisma } from './prisma'

export const lucia = new Lucia(new PrismaAdapter(prisma.session, prisma.user), {
  sessionExpiresIn: new TimeSpan(1, 'h'),
  sessionCookie: {
    name: 'lucia-astro-trading-journal-session',
    attributes: {
      secure: import.meta.env.PROD,
      sameSite: 'strict'
    }
  },
  getUserAttributes: (databaseUserAttributes: Record<string, any>) => {
    return {
      username: databaseUserAttributes.username
    }
  }
})

export type Auth = typeof lucia
