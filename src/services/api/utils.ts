/**
 * General API response type
 */
export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

/**
 * Creates a successful API response
 * @param data - The data to include in the response
 * @param status - The HTTP status code (default: 200)
 * @returns A Response object with the data
 */
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

/**
 * Creates an API error response
 * @param message - The error message
 * @param status - The HTTP status code
 * @param errors - Optional additional error details
 * @returns A Response object with the error
 */
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
