import type { APIRoute } from 'astro'
import { createBrokerSchema } from '~/schemas/broker.schema'
import { apiErrors, createApiResponse } from '~/services/api/utils'
import { createBroker, getAllBrokers } from '~/services/broker.service'

export const GET: APIRoute = async () => {
  try {
    const brokers = await getAllBrokers()

    return createApiResponse(brokers)
  } catch (error) {
    console.error('Error retrieving brokers:', error)

    return apiErrors.serverError()
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const result = createBrokerSchema.safeParse(body)

    if (!result.success) {
      return apiErrors.validationError(result.error.errors)
    }

    const newBroker = await createBroker(result.data)

    return createApiResponse(newBroker, 201)
  } catch (error) {
    console.error('Error creating broker:', error)

    return apiErrors.serverError()
  }
}
