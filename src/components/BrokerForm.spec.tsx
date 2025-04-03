import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CreateBrokerSchema } from '~/schemas/broker.schema'
import type { ApiResponse } from '~/services/api/utils'
import { BrokerForm } from './BrokerForm'

describe('BrokerForm', () => {
  const getNameInput = () => screen.getByRole('textbox', { name: /name/i })
  const getAccountNumberInput = () => screen.getByRole('textbox', { name: /account number/i })
  const getCurrencyInput = () => screen.getByRole('textbox', { name: /currency/i })
  const getSubmitButton = () => screen.getByRole('button', { name: /create broker/i })

  const mockBrokerData: CreateBrokerSchema = {
    name: 'Interactive Brokers',
    accountNumber: 'U123456789',
    currency: 'USD'
  }

  const mockSuccessResponse: ApiResponse = {
    success: true,
    data: {
      id: '1',
      ...mockBrokerData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const mockErrorResponse: ApiResponse = {
    success: false,
    message: 'Failed to save broker'
  }

  const setup = (defaultValues?: Partial<CreateBrokerSchema>) => {
    const mockOnSubmit = vi.fn()
    const user = userEvent.setup()
    const utils = render(<BrokerForm defaultValues={defaultValues} onSubmit={mockOnSubmit} />)
    return { user, mockOnSubmit, ...utils }
  }

  it('renders form fields and submit button', () => {
    setup()
    expect(getNameInput()).toBeInTheDocument()
    expect(getAccountNumberInput()).toBeInTheDocument()
    expect(getCurrencyInput()).toBeInTheDocument()
    expect(getSubmitButton()).toBeInTheDocument()
  })

  it('populates form with default values', () => {
    setup({
      name: 'Test Broker',
      accountNumber: 'A12345',
      currency: 'EUR'
    })

    expect(getNameInput()).toHaveValue('Test Broker')
    expect(getAccountNumberInput()).toHaveValue('A12345')
    expect(getCurrencyInput()).toHaveValue('EUR')
  })

  it('handles form validation and submission flow', async () => {
    const { user, mockOnSubmit } = setup()
    mockOnSubmit.mockResolvedValueOnce(mockSuccessResponse)

    const submitButton = getSubmitButton()

    // Form should be invalid and button disabled after first click with empty fields
    await user.click(submitButton)
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/currency is required/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Fill form with valid data
    await user.type(getNameInput(), mockBrokerData.name)
    await user.type(getAccountNumberInput(), mockBrokerData.accountNumber || '')
    await user.type(getCurrencyInput(), mockBrokerData.currency)

    // Button should be enabled now
    expect(submitButton).not.toBeDisabled()

    // Submit form with valid data
    await user.click(submitButton)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(mockBrokerData)
    })
  })

  it('handles submission errors', async () => {
    const { user, mockOnSubmit } = setup()
    mockOnSubmit.mockResolvedValueOnce(mockErrorResponse)

    // Fill form with valid data
    await user.type(getNameInput(), mockBrokerData.name)
    await user.type(getAccountNumberInput(), mockBrokerData.accountNumber || '')
    await user.type(getCurrencyInput(), mockBrokerData.currency)

    // First submission fails
    await user.click(getSubmitButton())
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to save broker/i)

    // Verify the error message is displayed
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('supports optional account number field', async () => {
    const { user, mockOnSubmit } = setup()
    mockOnSubmit.mockResolvedValueOnce(mockSuccessResponse)

    const brokerDataWithoutAccountNumber = {
      name: 'Test Broker',
      accountNumber: '',
      currency: 'USD'
    }

    // Fill form with valid data but empty account number
    await user.type(getNameInput(), brokerDataWithoutAccountNumber.name)
    await user.type(getCurrencyInput(), brokerDataWithoutAccountNumber.currency)

    // Submit form
    await user.click(getSubmitButton())
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(brokerDataWithoutAccountNumber)
    })
  })
})
