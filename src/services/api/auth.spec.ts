import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticateUser } from './auth'

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

  it('uses correct endpoint for signup mode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    await authenticateUser(mockAuthData, 'signup')

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', expect.anything())
  })
})
