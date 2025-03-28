import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiErrors, authenticateUser, createApiError, createApiResponse } from './api.service'

const mockFetch = vi.fn()
global.fetch = mockFetch
beforeEach(() => {
  mockFetch.mockReset()
})

describe('authenticateUser', () => {
  const mockAuthData = {
    username: 'testuser',
    password: 'password123'
  }

  it('returns success response when authentication succeeds', async () => {
    const expectedData = { user: { id: 1, username: 'testuser' } }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(expectedData)
    })

    const result = await authenticateUser(mockAuthData, 'login')

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockAuthData)
    })
    expect(result).toEqual({
      success: true,
      data: expectedData
    })
  })

  it('handles API error with provided error message from response', async () => {
    const errorMessage = 'Invalid credentials'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage })
    })

    const result = await authenticateUser(mockAuthData, 'login')

    expect(result).toEqual({
      success: false,
      message: errorMessage
    })
  })

  it('returns error response when network error occurs', async () => {
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValueOnce(networkError)

    const result = await authenticateUser(mockAuthData, 'login')

    expect(result).toEqual({
      success: false,
      message: 'Network error'
    })
  })

  it('falls back to default message when error has no message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    const result = await authenticateUser(mockAuthData, 'login')

    expect(result).toEqual({
      success: false,
      message: 'Authentication failed'
    })
  })

  it('returns generic error if response.json() fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => {
        throw new Error('Unexpected JSON error')
      }
    })

    const result = await authenticateUser(mockAuthData, 'login')

    expect(result).toEqual({
      success: false,
      message: 'Unexpected JSON error'
    })
  })
})

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
})
