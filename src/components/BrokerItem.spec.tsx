import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BrokerItem } from './BrokerItem'

const mockBroker = {
  id: '1',
  name: 'Test Broker',
  accountNumber: '123456',
  currency: 'USD',
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('BrokerItem', () => {
  it('renders broker information correctly', () => {
    render(<BrokerItem broker={mockBroker} onDelete={vi.fn()} />)

    expect(screen.getByText('Test Broker')).toBeInTheDocument()
    expect(screen.getByText('Account Number: 123456')).toBeInTheDocument()
    expect(screen.getByText('Currency: USD')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows N/A when account number is null', () => {
    const brokerWithoutAccount = {
      ...mockBroker,
      accountNumber: null
    }
    render(<BrokerItem broker={brokerWithoutAccount} onDelete={vi.fn()} />)
    expect(screen.getByText('Account Number: N/A')).toBeInTheDocument()
  })

  it('handles delete success', async () => {
    const onDelete = vi.fn()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    })

    render(<BrokerItem broker={mockBroker} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled()
    })
  })
})
