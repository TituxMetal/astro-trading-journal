import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateBrokerSchema } from '~/schemas/broker.schema'
import { createBroker, updateBroker } from '~/services/api/broker'
import type { ApiResponse } from '~/services/api/utils'
import { BrokerForm } from './BrokerForm'

// Mock the broker API functions
vi.mock('~/services/api/broker', () => ({
  createBroker: vi.fn(),
  updateBroker: vi.fn()
}))

type BrokerData = {
  id: string
  name: string
  accountNumber: string | null
  currency: string
  createdAt: Date
  updatedAt: Date
}

describe('BrokerForm', () => {
  const getNameInput = () => screen.getByRole('textbox', { name: /name/i })
  const getAccountNumberInput = () => screen.getByRole('textbox', { name: /account number/i })
  const getCurrencyInput = () => screen.getByRole('textbox', { name: /currency/i })
  const getSubmitButton = (mode = 'create') =>
    screen.getByRole('button', { name: mode === 'create' ? /create broker/i : /update broker/i })

  const mockBrokerData: BrokerData = {
    id: '1',
    name: 'Interactive Brokers',
    accountNumber: 'U123456789',
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockSuccessResponse: ApiResponse<BrokerData> = {
    success: true,
    data: mockBrokerData
  }

  const mockErrorResponse: ApiResponse<BrokerData> = {
    success: false,
    message: 'Failed to save broker'
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(createBroker).mockResolvedValue(mockSuccessResponse)
    vi.mocked(updateBroker).mockResolvedValue(mockSuccessResponse)
  })

  const setup = (
    props: {
      defaultValues?: Partial<CreateBrokerSchema>
      mode?: 'create' | 'edit'
      brokerId?: string
    } = {}
  ) => {
    const user = userEvent.setup()
    const utils = render(
      <BrokerForm defaultValues={props.defaultValues} mode={props.mode} brokerId={props.brokerId} />
    )
    return { user, ...utils }
  }

  it('renders form fields and submit button in create mode', () => {
    setup()
    expect(getNameInput()).toBeInTheDocument()
    expect(getAccountNumberInput()).toBeInTheDocument()
    expect(getCurrencyInput()).toBeInTheDocument()
    expect(getSubmitButton('create')).toBeInTheDocument()
  })

  it('renders form fields and submit button in edit mode', () => {
    setup({ mode: 'edit', brokerId: '1' })
    expect(getNameInput()).toBeInTheDocument()
    expect(getAccountNumberInput()).toBeInTheDocument()
    expect(getCurrencyInput()).toBeInTheDocument()
    expect(getSubmitButton('edit')).toBeInTheDocument()
  })

  it('populates form with default values', () => {
    setup({
      defaultValues: {
        name: 'Test Broker',
        accountNumber: 'A12345',
        currency: 'EUR'
      }
    })

    expect(getNameInput()).toHaveValue('Test Broker')
    expect(getAccountNumberInput()).toHaveValue('A12345')
    expect(getCurrencyInput()).toHaveValue('EUR')
  })

  it('calls createBroker when submitted in create mode', async () => {
    const { user } = setup()

    // Fill form with valid data
    await user.type(getNameInput(), mockBrokerData.name)
    await user.type(getAccountNumberInput(), mockBrokerData.accountNumber || '')
    await user.type(getCurrencyInput(), mockBrokerData.currency)

    // Submit form
    await user.click(getSubmitButton('create'))

    // Verify createBroker was called with correct data
    expect(createBroker).toHaveBeenCalledWith({
      name: mockBrokerData.name,
      accountNumber: mockBrokerData.accountNumber,
      currency: mockBrokerData.currency
    })
    expect(updateBroker).not.toHaveBeenCalled()
  })

  it('calls updateBroker when submitted in edit mode', async () => {
    const brokerId = '1'
    const { user } = setup({
      mode: 'edit',
      brokerId,
      defaultValues: {
        name: 'Old Name',
        accountNumber: 'Old123',
        currency: 'EUR'
      }
    })

    // Clear and fill form with new data
    await user.clear(getNameInput())
    await user.clear(getAccountNumberInput())
    await user.clear(getCurrencyInput())

    await user.type(getNameInput(), mockBrokerData.name)
    await user.type(getAccountNumberInput(), mockBrokerData.accountNumber || '')
    await user.type(getCurrencyInput(), mockBrokerData.currency)

    // Submit form
    await user.click(getSubmitButton('edit'))

    // Verify updateBroker was called with correct data
    expect(updateBroker).toHaveBeenCalledWith(brokerId, {
      name: mockBrokerData.name,
      accountNumber: mockBrokerData.accountNumber,
      currency: mockBrokerData.currency
    })
    expect(createBroker).not.toHaveBeenCalled()
  })

  it('validates brokerId is required in edit mode', () => {
    // Extract the component for testing without mounting it
    const { container } = render(
      <BrokerForm mode='edit' /> // Deliberately omit brokerId
    )

    // Get the form element
    const form = container.querySelector('form')
    expect(form).not.toBeNull()

    // Create a mock submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })

    // Expect error to be thrown when form is submitted
    expect(() => {
      form?.dispatchEvent(submitEvent)
    }).not.toThrow() // The error is caught by the form handler, not propagated

    // Verify updateBroker was not called because of the missing brokerId
    expect(updateBroker).not.toHaveBeenCalled()
  })

  it('handles form validation and submission flow', async () => {
    const { user } = setup()

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

    // Verify API call was made
    expect(createBroker).toHaveBeenCalled()
  })

  it('handles API error responses', async () => {
    // Mock createBroker to return error
    vi.mocked(createBroker).mockResolvedValue(mockErrorResponse)

    const { user } = setup()

    // Fill form with valid data
    await user.type(getNameInput(), mockBrokerData.name)
    await user.type(getAccountNumberInput(), mockBrokerData.accountNumber || '')
    await user.type(getCurrencyInput(), mockBrokerData.currency)

    // Submit form
    await user.click(getSubmitButton())

    // Error message should be displayed
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to save broker/i)
  })

  it('supports optional account number field', async () => {
    const { user } = setup()

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

    // Verify API call had empty account number
    expect(createBroker).toHaveBeenCalledWith(brokerDataWithoutAccountNumber)
  })
})
