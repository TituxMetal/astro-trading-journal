import type { APIRoute } from 'astro'
import { lucia } from '~/lib/lucia'
import { authSchema } from '~/schemas/auth.schema'
import { apiErrors } from '~/services/api.service'
import { findUserByUsername, verifyPassword } from '~/services/auth.service'

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
      // Find user by username
      const user = await findUserByUsername(username)

      // Verify password
      const authMethod = user.authMethods[0]
      if (!authMethod?.hashedPassword) {
        throw new Error('Invalid credentials')
      }

      await verifyPassword(authMethod.hashedPassword, password)

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
      // Don't expose specific errors to client for security
      return apiErrors.invalidCredentials()
    }
  } catch (error) {
    console.error('Login error:', error)
    return apiErrors.serverError()
  }
}
