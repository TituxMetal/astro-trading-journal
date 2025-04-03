import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CreateBrokerSchema } from '~/schemas/broker.schema'
import type { ApiResponse } from '~/services/api/utils'
import { useBrokerForm } from './useBrokerForm'

describe('useBrokerForm', () => {
  const mockBrokerData: CreateBrokerSchema = {
    name: 'Test Broker',
    accountNumber: '12345',
    currency: 'USD'
  }

  const mockSuccessResponse: ApiResponse = {
    success: true,
    data: { id: '123', ...mockBrokerData, createdAt: new Date(), updatedAt: new Date() }
  }

  const mockErrorResponse: ApiResponse = {
    success: false,
    message: 'Failed to save broker'
  }

  const mockSubmitSuccess = vi.fn().mockResolvedValue(mockSuccessResponse)
  const mockSubmitError = vi.fn().mockResolvedValue(mockErrorResponse)

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useBrokerForm({ name: 'Test Broker', currency: 'USD' }, mockSubmitSuccess)
    )

    expect(result.current.serverError).toBeNull()
    expect(result.current.form).toBeDefined()
    expect(result.current.isError).toBe(false)
  })

  it('handles successful submission', async () => {
    const { result } = renderHook(() => useBrokerForm({}, mockSubmitSuccess))

    await act(async () => {
      result.current.form.setValue('name', mockBrokerData.name)
      result.current.form.setValue('accountNumber', mockBrokerData.accountNumber || '')
      result.current.form.setValue('currency', mockBrokerData.currency)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSubmitSuccess).toHaveBeenCalledWith(mockBrokerData)
    expect(result.current.serverError).toBeNull()
  })

  it('handles submission error', async () => {
    const { result } = renderHook(() => useBrokerForm({}, mockSubmitError))

    await act(async () => {
      result.current.form.setValue('name', mockBrokerData.name)
      result.current.form.setValue('accountNumber', mockBrokerData.accountNumber || '')
      result.current.form.setValue('currency', mockBrokerData.currency)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockSubmitError).toHaveBeenCalledWith(mockBrokerData)
    expect(result.current.serverError).toBe('Failed to save broker')
  })

  it('clears server error on new submission', async () => {
    const mockSubmit = vi
      .fn()
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useBrokerForm({}, mockSubmit))

    await act(async () => {
      result.current.form.setValue('name', mockBrokerData.name)
      result.current.form.setValue('accountNumber', mockBrokerData.accountNumber || '')
      result.current.form.setValue('currency', mockBrokerData.currency)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })
    expect(result.current.serverError).toBe('Failed to save broker')

    await act(async () => {
      await result.current.handleSubmit()
    })
    expect(result.current.serverError).toBeNull()
  })

  it('validates required fields', async () => {
    const { result } = renderHook(() => useBrokerForm({}, mockSubmitSuccess))

    await act(async () => {
      await result.current.form.handleSubmit(() => {})()
    })

    // name and currency are required fields
    expect(Object.keys(result.current.form.formState.errors)).toHaveLength(2)
    expect(result.current.isError).toBe(true)
  })

  it('updates isError based on form validation', async () => {
    const { result } = renderHook(() => useBrokerForm({}, mockSubmitSuccess))

    expect(result.current.isError).toBe(false)

    await act(async () => {
      await result.current.form.handleSubmit(() => {})()
    })

    expect(result.current.isError).toBe(true)

    await act(async () => {
      result.current.form.setValue('name', 'Test Broker')
      result.current.form.setValue('currency', 'USD')
      await result.current.form.trigger()
    })

    expect(result.current.isError).toBe(false)
  })
})
