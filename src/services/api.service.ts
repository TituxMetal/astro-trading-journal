import type { AuthSchema } from '~/schemas/auth.schema'
import type { AuthMode } from '~/types/auth.types'

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

export const authenticateUser = async (
  data: AuthSchema,
  mode: AuthMode
): Promise<ApiResponse<{ id: string; username: string }>> => {
  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Authentication failed'
      }
    }

    return {
      success: true,
      data: result
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

    return {
      success: false,
      message: errorMessage
    }
  }
}

export const createApiResponse = <T>(data: T, status = 200) => {
  return new Response(
    JSON.stringify({
      success: true,
      data
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

export const createApiError = (message: string, status = 400, errors?: unknown) => {
  const responseBody: Record<string, unknown> = {
    success: false,
    message
  }

  if (errors) {
    responseBody.errors = errors
  }

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * Common API error responses
 */
export const apiErrors = {
  unauthorized: () => createApiError('Unauthorized', 401),

  invalidCredentials: () => createApiError('Invalid credentials', 401),

  notFound: (resource = 'Resource') => createApiError(`${resource} not found`, 404),

  badRequest: (message = 'Bad request') => createApiError(message, 400),

  validationError: (errors: unknown) => createApiError('Validation error', 422, errors),

  serverError: (message = 'Internal server error') => createApiError(message, 500)
}
