import type { Broker } from '@prisma/client'
import type { CreateBrokerSchema, UpdateBrokerSchema } from '~/schemas/broker.schema'
import { type ApiResponse, apiRequest } from './utils'

/**
 * Creates a new broker in the database
 *
 * @param data - The broker data to create
 * @returns A promise that resolves to the API response containing the created broker
 * @example
 * ```typescript
 * const result = await createBroker({
 *   name: 'Interactive Brokers',
 *   accountNumber: 'U123456789',
 *   currency: 'USD'
 * })
 *
 * !result.success && console.error('Failed:', result.message)
 * result.success && console.log('Broker created:', result.data)
 * ```
 */
export const createBroker = async (data: CreateBrokerSchema): Promise<ApiResponse<Broker>> =>
  apiRequest<Broker>(
    '/api/brokers',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    'Failed to create broker'
  )

/**
 * Fetches all brokers from the database
 *
 * @returns A promise that resolves to the API response containing an array of brokers
 * @example
 * ```typescript
 * const result = await fetchBrokers()
 *
 * !result.success && console.error('Failed to fetch brokers:', result.message)
 * result.success && result.data.forEach(broker => console.log(broker.name))
 * ```
 */
export const fetchBrokers = async (): Promise<ApiResponse<Broker[]>> =>
  apiRequest<Broker[]>('/api/brokers', undefined, 'Failed to fetch brokers')

/**
 * Deletes a broker from the database
 *
 * @param id - The ID of the broker to delete
 * @returns A promise that resolves to the API response indicating success or failure
 * @example
 * ```typescript
 * const brokerId = '123'
 * const result = await deleteBroker(brokerId)
 *
 * result.success
 *   ? console.log('Broker deleted successfully')
 *   : console.error('Failed to delete broker:', result.message)
 * ```
 */
export const deleteBroker = async (id: string): Promise<ApiResponse<void>> =>
  apiRequest<void>(`/api/brokers/${id}`, { method: 'DELETE' }, 'Failed to delete broker')

/**
 * Updates an existing broker in the database
 *
 * @param id - The ID of the broker to update
 * @param data - The broker data to update
 * @returns A promise that resolves to the API response containing the updated broker
 * @example
 * ```typescript
 * const brokerId = '123'
 * const result = await updateBroker(brokerId, {
 *   name: 'Updated Broker Name',
 *   currency: 'EUR'
 * })
 *
 * !result.success && console.error('Update failed:', result.message)
 * result.success && console.log('Broker updated:', result.data)
 * ```
 */
export const updateBroker = async (
  id: string,
  data: UpdateBrokerSchema
): Promise<ApiResponse<Broker>> =>
  apiRequest<Broker>(
    `/api/brokers/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    'Failed to update broker'
  )

/**
 * Fetches a single broker by ID from the database
 *
 * @param id - The ID of the broker to fetch
 * @returns A promise that resolves to the API response containing the broker
 * @example
 * ```typescript
 * const brokerId = '123'
 * const result = await fetchBroker(brokerId)
 *
 * result.success
 *   ? console.log('Broker details:', result.data)
 *   : console.error('Failed to fetch broker:', result.message)
 * ```
 */
export const fetchBroker = async (id: string): Promise<ApiResponse<Broker>> =>
  apiRequest<Broker>(`/api/brokers/${id}`, undefined, 'Failed to fetch broker')
