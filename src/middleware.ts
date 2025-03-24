import type { APIContext, MiddlewareNext } from 'astro'
import { lucia } from './lib/lucia'

export const onRequest = async (context: APIContext, next: MiddlewareNext) => {
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null

  if (process.env.NODE_ENV === 'development') {
    console.log('sessionId from middleware', sessionId)
  }

  if (!sessionId) {
    context.locals.user = null
    context.locals.session = null

    return next()
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)

    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie()

    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  }

  context.locals.session = session
  context.locals.user = user

  return next()
}
