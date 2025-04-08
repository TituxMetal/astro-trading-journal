import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBroker } from './broker'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('createBroker', () => {
  const mockBrokerData = {
    name: 'Interactive Brokers',
    accountNumber: 'U123456789',
    currency: 'USD'
  }

  it('returns success response when broker creation succeeds', async () => {
    const expectedData = {
      id: 'bf7a92e6-bfe4-4537-a861-c4cd95aeabe3',
      ...mockBrokerData,
      createdAt: '2023-07-01T12:00:00.000Z',
      updatedAt: '2023-07-01T12:00:00.000Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(expectedData)
    })

    const result = await createBroker(mockBrokerData)

    expect(mockFetch).toHaveBeenCalledWith('/api/brokers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockBrokerData)
    })
    expect(result).toEqual({
      success: true,
      data: expectedData
    })
  })

  it('handles API error with provided error message from response', async () => {
    const errorMessage = 'A broker with the name Interactive Brokers already exists'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage })
    })

    const result = await createBroker(mockBrokerData)

    expect(result).toEqual({
      success: false,
      message: errorMessage
    })
  })

  it('returns error response when network error occurs', async () => {
    const networkError = new Error('Network error')
    mockFetch.mockRejectedValueOnce(networkError)

    const result = await createBroker(mockBrokerData)

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

    const result = await createBroker(mockBrokerData)

    expect(result).toEqual({
      success: false,
      message: 'Failed to create broker'
    })
  })

  it('returns generic error if response.json() fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => {
        throw new Error('Unexpected JSON error')
      }
    })

    const result = await createBroker(mockBrokerData)

    expect(result).toEqual({
      success: false,
      message: 'Unexpected JSON error'
    })
  })
})
