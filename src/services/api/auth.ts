import type { AuthSchema } from '~/schemas/auth.schema'
import type { AuthMode } from '~/types/auth.types'
import type { ApiResponse } from './utils'

/**
 * Authenticates a user through the API
 * @param data - The authentication data
 * @param mode - The authentication mode (login or signup)
 * @returns API response with user data on success
 */
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
