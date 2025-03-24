import { ActionError, defineAction } from 'astro:actions'
import { lucia } from '~/lib/lucia'
import { authSchema } from '~/schemas/auth.schema'
import { createNewUser, findUserByUsername, verifyPassword } from '~/services/auth.service'

export const auth = {
  login: defineAction({
    accept: 'form',
    input: authSchema,
    handler: async (input, context) => {
      try {
        const existingUser = await findUserByUsername(input.username)

        if (!existingUser) {
          throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials'
          })
        }

        const validPassword = await verifyPassword(
          existingUser.authMethods[0].hashedPassword,
          input.password
        )

        if (!validPassword) {
          throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials'
          })
        }

        // Create a new session
        const session = await lucia.createSession(existingUser.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)

        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

        return {
          success: true,
          message: 'Logged in successfully'
        }
      } catch (error) {
        console.error('Login error:', error)

        if (error instanceof ActionError) {
          throw error
        }

        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during login'
        })
      }
    }
  }),

  signup: defineAction({
    accept: 'form',
    input: authSchema,
    handler: async (input, context) => {
      try {
        const existingUser = await findUserByUsername(input.username)

        if (existingUser) {
          throw new ActionError({
            code: 'CONFLICT',
            message: 'Invalid credentials'
          })
        }

        const newUser = await createNewUser(input.username, input.password)

        if (!newUser) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during signup'
          })
        }

        // Create a new session
        const session = await lucia.createSession(newUser.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)

        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

        return {
          success: true,
          message: 'User created successfully'
        }
      } catch (error) {
        console.error('Signup error:', error)

        if (error instanceof ActionError) {
          throw error
        }

        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during signup'
        })
      }
    }
  }),

  logout: defineAction({
    accept: 'form',
    handler: async (_, context) => {
      if (!context.locals.session) {
        return new Response(null, {
          status: 401
        })
      }

      await lucia.invalidateSession(context.locals.session.id)

      const sessionCookie = lucia.createBlankSessionCookie()

      context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

      return {}
    }
  })
}
