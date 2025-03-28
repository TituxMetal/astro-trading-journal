import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AuthSchema } from '~/schemas/auth.schema'
import type { ApiResponse } from '~/services/api.service'
import { useAuthForm } from './useAuthForm'

describe('useAuthForm', () => {
  const mockAuthData: AuthSchema = {
    username: 'testuser',
    password: 'password123'
  }

  const mockSuccessResponse: ApiResponse = {
    success: true,
    data: { id: 1, username: 'testuser' }
  }

  const mockErrorResponse: ApiResponse = {
    success: false,
    message: 'Invalid credentials'
  }

  const mockAuthenticateSuccess = vi.fn().mockResolvedValue(mockSuccessResponse)
  const mockAuthenticateError = vi.fn().mockResolvedValue(mockErrorResponse)

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAuthForm('login', mockAuthenticateSuccess))

    expect(result.current.serverError).toBeNull()
    expect(result.current.isError).toBe(false)
    expect(result.current.form.formState.errors).toEqual({})
  })

  it('handles successful authentication', async () => {
    const { result } = renderHook(() => useAuthForm('login', mockAuthenticateSuccess))

    await act(async () => {
      result.current.form.setValue('username', mockAuthData.username)
      result.current.form.setValue('password', mockAuthData.password)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockAuthenticateSuccess).toHaveBeenCalledWith(mockAuthData, 'login')
    expect(result.current.serverError).toBeNull()
  })

  it('handles authentication error', async () => {
    const { result } = renderHook(() => useAuthForm('login', mockAuthenticateError))

    await act(async () => {
      result.current.form.setValue('username', mockAuthData.username)
      result.current.form.setValue('password', mockAuthData.password)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockAuthenticateError).toHaveBeenCalledWith(mockAuthData, 'login')
    expect(result.current.serverError).toBe('Invalid credentials')
  })

  it('clears server error on new submission', async () => {
    const mockAuthenticate = vi
      .fn()
      .mockResolvedValueOnce(mockErrorResponse)
      .mockResolvedValueOnce(mockSuccessResponse)

    const { result } = renderHook(() => useAuthForm('login', mockAuthenticate))

    await act(async () => {
      result.current.form.setValue('username', mockAuthData.username)
      result.current.form.setValue('password', mockAuthData.password)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })
    expect(result.current.serverError).toBe('Invalid credentials')

    await act(async () => {
      await result.current.handleSubmit()
    })
    expect(result.current.serverError).toBeNull()
  })

  it('validates required fields', async () => {
    const { result } = renderHook(() => useAuthForm('login', mockAuthenticateSuccess))

    await act(async () => {
      await result.current.form.handleSubmit(() => {})()
    })

    expect(Object.keys(result.current.form.formState.errors)).toHaveLength(2)
    expect(result.current.isError).toBe(true)
  })

  it('updates isError based on form validation', async () => {
    const { result } = renderHook(() => useAuthForm('login', mockAuthenticateSuccess))

    expect(result.current.isError).toBe(false)

    await act(async () => {
      await result.current.form.handleSubmit(() => {})()
    })

    expect(result.current.isError).toBe(true)

    await act(async () => {
      result.current.form.setValue('username', 'testuser')
      result.current.form.setValue('password', 'password123')
      await result.current.form.trigger()
    })

    expect(result.current.isError).toBe(false)
  })

  it('passes mode to authenticate function', async () => {
    const { result } = renderHook(() => useAuthForm('signup', mockAuthenticateSuccess))

    await act(async () => {
      result.current.form.setValue('username', mockAuthData.username)
      result.current.form.setValue('password', mockAuthData.password)
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockAuthenticateSuccess).toHaveBeenCalledWith(mockAuthData, 'signup')
  })
})
