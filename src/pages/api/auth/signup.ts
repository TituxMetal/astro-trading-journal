import type { APIRoute } from 'astro'
import { lucia } from '~/lib/lucia'
import { authSchema } from '~/schemas/auth.schema'
import { apiErrors } from '~/services/api/utils'
import { createNewUser } from '~/services/auth.service'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()

    // Validate request body against schema
    const result = authSchema.safeParse(body)

    if (!result.success) {
      return apiErrors.validationError(result.error.errors)
    }

    const { username, password } = result.data

    try {
      // Create new user
      const user = await createNewUser(username, password)

      // Create session
      const session = await lucia.createSession(user.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)

      cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '/',
        ...sessionCookie.attributes
      })

      // Return a redirect response
      // return new Response(null, {
      //   status: 302,
      //   headers: {
      //     Location: '/'
      //   }
      // })
      return new Response(
        JSON.stringify({
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username
          }
        }),
        { status: 200 }
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return apiErrors.badRequest('Username already taken')
      }

      return apiErrors.serverError('Failed to create user')
    }
  } catch (error) {
    console.error('Signup error:', error)
    return apiErrors.serverError()
  }
}
