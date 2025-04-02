import type { Broker } from '@prisma/client'
import type { CreateBrokerSchema } from '~/schemas/broker.schema'
import type { ApiResponse } from './utils'

/**
 * Creates a new broker through the API
 * @param data - The broker data to create
 * @returns API response with the created broker on success
 */
export const createBroker = async (data: CreateBrokerSchema): Promise<ApiResponse<Broker>> => {
  try {
    const response = await fetch('/api/brokers', {
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
        message: result.message || 'Failed to create broker'
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

/**
 * Fetches all brokers through the API
 * @returns API response with the list of brokers on success
 */
export const fetchBrokers = async (): Promise<ApiResponse<Broker[]>> => {
  try {
    const response = await fetch('/api/brokers')
    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to fetch brokers'
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Deletes a broker through the API
 * @param id - The ID of the broker to delete
 * @returns API response indicating success or failure
 */
export const deleteBroker = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`/api/brokers/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const result = await response.json()
      return {
        success: false,
        message: result.message || 'Failed to delete broker'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

    return {
      success: false,
      message: errorMessage
    }
  }
}
