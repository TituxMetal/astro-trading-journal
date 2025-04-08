/**
 * Represents a standardized API response structure
 * @template T - The type of data returned in a successful response
 */
export type ApiResponse<T = unknown> = {
  /** Indicates whether the request was successful */
  success: boolean
  /** Optional error message in case of failure */
  message?: string
  /** Optional response data in case of success */
  data?: T
}

/**
 * Creates a successful API response with consistent structure
 *
 * @template T - The type of data to be returned
 * @param data - The data to include in the response
 * @param status - The HTTP status code (default: 200)
 * @returns A formatted Response object with JSON data
 * @example
 * ```typescript
 * // Creating a success response with user data
 * const userData = { id: 1, name: 'John' }
 * const response = createApiResponse(userData, 201)
 *
 * // Response body will be:
 * // {"success":true,"data":{"id":1,"name":"John"}}
 * ```
 */
export const createApiResponse = <T>(data: T, status = 200): Response =>
  new Response(
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

/**
 * Creates an API error response with consistent structure
 *
 * @template E - The type of additional error details
 * @param message - The error message
 * @param status - The HTTP status code (default: 400)
 * @param errors - Optional additional error details
 * @returns A formatted Response object with JSON error data
 * @example
 * ```typescript
 * // Creating a simple error response
 * const response = createApiError('Resource not found', 404)
 *
 * // Creating an error with validation details
 * const validationErrors = [
 *   { field: 'email', message: 'Invalid email format' }
 * ]
 * const response = createApiError('Validation failed', 422, validationErrors)
 * ```
 */
export const createApiError = <E = unknown>(
  message: string,
  status = 400,
  errors?: E
): Response => {
  const responseBody: Record<string, unknown> = { success: false, message }
  if (errors)
    return new Response(JSON.stringify({ ...responseBody, errors }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Collection of common API error responses for consistent error handling
 *
 * @example
 * ```typescript
 * // Unauthorized access
 * return apiErrors.unauthorized()
 *
 * // Resource not found with custom message
 * return apiErrors.notFound('User')
 *
 * // Validation errors
 * const errors = [{ field: 'email', message: 'Invalid format' }]
 * return apiErrors.validationError(errors)
 * ```
 */
export const apiErrors = {
  /**
   * Creates a 401 Unauthorized error response
   */
  unauthorized: () => createApiError('Unauthorized', 401),

  /**
   * Creates a 401 Invalid credentials error response
   */
  invalidCredentials: () => createApiError('Invalid credentials', 401),

  /**
   * Creates a 404 Not Found error response with optional resource name
   * @param resource - The name of the resource that wasn't found
   */
  notFound: (resource = 'Resource') => createApiError(`${resource} not found`, 404),

  /**
   * Creates a 400 Bad Request error response
   * @param message - Custom error message
   */
  badRequest: (message = 'Bad request') => createApiError(message, 400),

  /**
   * Creates a 422 Validation Error response with detailed errors
   * @param errors - Validation error details
   */
  validationError: (errors: unknown) => createApiError('Validation error', 422, errors),

  /**
   * Creates a 500 Internal Server Error response
   * @param message - Custom error message
   */
  serverError: (message = 'Internal server error') => createApiError(message, 500)
}

/**
 * A generic API request function for client-side data fetching
 *
 * Handles fetch operations, response parsing, and error handling with
 * a consistent response structure.
 *
 * @template T - The expected data type on success
 * @param url - The endpoint URL to fetch from
 * @param options - Optional fetch configuration
 * @param defaultError - Default error message if none is provided by the server
 * @returns A promise resolving to a standardized ApiResponse object
 * @example
 * ```typescript
 * // Basic GET request
 * const getUserResult = await apiRequest<User>('/api/users/123')
 *
 * getUserResult.success
 *   ? console.log('User data:', getUserResult.data)
 *   : console.error('Error:', getUserResult.message)
 *
 * // POST request with body
 * const createUserResult = await apiRequest<User>(
 *   '/api/users',
 *   {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' })
 *   }
 * )
 *
 * !createUserResult.success && console.error('Failed to create user')
 * createUserResult.success && console.log('Created user:', createUserResult.data)
 * ```
 */
export const apiRequest = async <T>(
  url: string,
  options?: RequestInit,
  defaultError = 'An error occurred'
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, options)
    const result = await response.json()

    if (!response.ok) return { success: false, message: result.message ?? defaultError }

    return { success: true, data: result.data ?? result }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}
