import type { APIRoute } from 'astro'
import { updateBrokerSchema } from '~/schemas/broker.schema'
import { apiErrors, createApiResponse } from '~/services/api/utils'
import { deleteBroker, getBrokerById, updateBroker } from '~/services/broker.service'

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return apiErrors.validationError([{ message: 'Broker ID is required.' }])
    }

    const broker = await getBrokerById(id)
    return createApiResponse(broker)
  } catch (error) {
    console.error('Error retrieving broker:', error)
    return apiErrors.serverError()
  }
}

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params

    if (!id) {
      return apiErrors.validationError([{ message: 'Broker ID is required.' }])
    }

    const body = await request.json()
    const result = updateBrokerSchema.safeParse(body)

    if (!result.success) {
      return apiErrors.validationError(result.error.errors)
    }

    const updatedBroker = await updateBroker(id, result.data)

    return createApiResponse(updatedBroker)
  } catch (error) {
    console.error('Error updating broker:', error)

    return apiErrors.serverError()
  }
}

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return apiErrors.validationError([{ message: 'Broker ID is required.' }])
    }

    await deleteBroker(id)

    return createApiResponse(null, 204)
  } catch (error) {
    console.error('Error deleting broker:', error)

    return apiErrors.serverError()
  }
}
