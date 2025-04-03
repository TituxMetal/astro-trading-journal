import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AuthSchema } from '~/schemas/auth.schema'
import type { ApiResponse } from '~/services/api/utils'
import { AuthForm } from './AuthForm'

describe('AuthForm', () => {
  const getUsernameInput = () => screen.getByRole('textbox', { name: /username/i })
  const getPasswordInput = () => screen.getByLabelText(/password/i)
  const getSubmitButton = () => screen.getByRole('button', { name: /login|sign up/i })

  const mockSuccessResponse: ApiResponse = {
    success: true,
    data: { id: 1, username: 'testuser' }
  }

  const mockErrorResponse: ApiResponse = {
    success: false,
    message: 'Invalid credentials'
  }

  const mockAuthData: AuthSchema = {
    username: 'testuser',
    password: 'password123'
  }

  const setup = (mode: 'login' | 'signup' = 'login') => {
    // cleanup()
    const mockAuthenticate = vi.fn()
    const user = userEvent.setup()
    const utils = render(<AuthForm mode={mode} onAuthenticate={mockAuthenticate} />)
    return { user, mockAuthenticate, ...utils }
  }

  const modes = [
    {
      mode: 'login',
      buttonText: 'Login',
      linkText: 'Need an account?',
      linkHref: '/auth?mode=signup'
    },
    {
      mode: 'signup',
      buttonText: 'Sign Up',
      linkText: 'Already have an account?',
      linkHref: '/auth?mode=login'
    }
  ] as const

  describe.each(modes)('$mode mode', ({ mode, buttonText, linkText, linkHref }) => {
    const setup = () => {
      const mockAuthenticate = vi.fn().mockResolvedValue(mockSuccessResponse)
      const user = userEvent.setup()
      render(<AuthForm mode={mode} onAuthenticate={mockAuthenticate} />)
      return { user, mockAuthenticate }
    }

    it(`renders ${buttonText} button and ${linkText} link`, () => {
      setup()
      expect(screen.getByRole('button', { name: new RegExp(buttonText, 'i') })).toBeInTheDocument()
      expect(screen.getByText(new RegExp(linkText, 'i'))).toHaveAttribute('href', linkHref)
    })

    it('handles form submission', async () => {
      const { user, mockAuthenticate } = setup()
      await user.type(screen.getByLabelText(/username/i), mockAuthData.username)
      await user.type(screen.getByLabelText(/password/i), mockAuthData.password)
      await user.click(screen.getByRole('button', { name: new RegExp(buttonText, 'i') }))
      expect(mockAuthenticate).toHaveBeenCalledWith(mockAuthData, mode)
    })
  })

  it('handles form validation and submission flow', async () => {
    const { user, mockAuthenticate } = setup()
    mockAuthenticate.mockResolvedValueOnce(mockSuccessResponse)

    const submitButton = getSubmitButton()

    await user.click(submitButton)
    expect(await screen.findByText(/string must contain at least 3 character/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await user.type(getUsernameInput(), mockAuthData.username)
    await user.type(getPasswordInput(), mockAuthData.password)
    expect(submitButton).not.toBeDisabled()

    await user.click(submitButton)
    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalledWith(mockAuthData, 'login')
    })
  })

  it('handles authentication errors', async () => {
    const { user, mockAuthenticate } = setup()
    mockAuthenticate.mockResolvedValueOnce(mockErrorResponse)
    mockAuthenticate.mockResolvedValueOnce(mockSuccessResponse)

    await user.type(getUsernameInput(), mockAuthData.username)
    await user.type(getPasswordInput(), mockAuthData.password)
    await user.click(getSubmitButton())

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i)

    await user.click(getSubmitButton())

    await user.clear(getUsernameInput())
    await user.type(getUsernameInput(), 'testuser')

    await user.clear(getPasswordInput())
    await user.type(getPasswordInput(), 'password123')

    await user.click(getSubmitButton())

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
    })
  })

  it('sets correct password autocomplete for login mode', () => {
    setup('login')
    expect(getPasswordInput()).toHaveAttribute('autocomplete', 'current-password')
  })

  it('sets correct password autocomplete for signup mode', () => {
    setup('signup')
    expect(getPasswordInput()).toHaveAttribute('autocomplete', 'new-password')
  })
})
