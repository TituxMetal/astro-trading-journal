import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BrokerList } from './BrokerList'

const mockBrokers = [
  {
    id: '1',
    name: 'Test Broker 1',
    accountNumber: '123456',
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Test Broker 2',
    accountNumber: '789012',
    currency: 'EUR',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

describe('BrokerList', () => {
  it('renders brokers list when data is loaded', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBrokers })
    })

    render(<BrokerList />)

    await waitFor(() => {
      expect(screen.getByText('Test Broker 1')).toBeInTheDocument()
      expect(screen.getByText('Test Broker 2')).toBeInTheDocument()
    })
  })

  it('renders empty state when no brokers are found', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })

    render(<BrokerList />)

    await waitFor(() => {
      expect(screen.getByText('No brokers found.')).toBeInTheDocument()
    })
  })

  it('renders error state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to fetch brokers' })
    })

    render(<BrokerList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch brokers')).toBeInTheDocument()
    })
  })

  it('refetches data when retry button is clicked', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to fetch brokers' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockBrokers })
      })

    render(<BrokerList />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch brokers')).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: 'Try Again' })
    await userEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Test Broker 1')).toBeInTheDocument()
      expect(screen.getByText('Test Broker 2')).toBeInTheDocument()
    })
  })
})
