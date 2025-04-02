import { describe, expect, it } from 'vitest'
import { apiErrors, createApiError, createApiResponse } from './utils'

describe('createApiResponse', () => {
  it('creates a successful response with data', async () => {
    const testData = { id: 1, name: 'test' }

    const response = createApiResponse(testData)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(body).toEqual({
      success: true,
      data: testData
    })
  })

  it('creates a response with custom status code', async () => {
    const testData = { id: 1 }

    const response = createApiResponse(testData, 201)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual({
      success: true,
      data: testData
    })
  })
})

describe('createApiError', () => {
  it('creates an error response with message', async () => {
    const errorMessage = 'Test error'

    const response = createApiError(errorMessage)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(body).toEqual({
      success: false,
      message: errorMessage
    })
  })

  it('creates an error response with custom status and errors', async () => {
    const errorMessage = 'Validation failed'
    const errors = { field: ['Invalid value'] }

    const response = createApiError(errorMessage, 422, errors)
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body).toEqual({
      success: false,
      message: errorMessage,
      errors
    })
  })
})

describe('apiErrors', () => {
  it('creates unauthorized error response', async () => {
    const response = apiErrors.unauthorized()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      success: false,
      message: 'Unauthorized'
    })
  })

  it('creates not found error with custom resource', async () => {
    const response = apiErrors.notFound('User')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({
      success: false,
      message: 'User not found'
    })
  })

  it('creates validation error with errors object', async () => {
    const validationErrors = { field: ['Required'] }

    const response = apiErrors.validationError(validationErrors)
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body).toEqual({
      success: false,
      message: 'Validation error',
      errors: validationErrors
    })
  })

  it('creates server error with default message', async () => {
    const response = apiErrors.serverError()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      success: false,
      message: 'Internal server error'
    })
  })

  it('creates server error with custom message', async () => {
    const errorMessage = 'Database connection failed'
    const response = apiErrors.serverError(errorMessage)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({
      success: false,
      message: errorMessage
    })
  })

  it('creates bad request error with default message', async () => {
    const response = apiErrors.badRequest()
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      message: 'Bad request'
    })
  })

  it('creates bad request error with custom message', async () => {
    const errorMessage = 'Invalid input data'
    const response = apiErrors.badRequest(errorMessage)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({
      success: false,
      message: errorMessage
    })
  })
})
