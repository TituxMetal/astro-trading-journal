import type { Broker } from '@prisma/client'
import { useEffect, useState } from 'react'
import { fetchBrokers } from '~/services/api/broker'
import { BrokerItem } from './BrokerItem'

export const BrokerList = () => {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [error, setError] = useState('')

  const loadBrokers = async () => {
    try {
      setError('')
      const result = await fetchBrokers()

      if (!result.success) {
        setError(result.message || 'Failed to fetch brokers')
        return
      }

      setBrokers(result.data || [])
    } catch (error) {
      setError('Failed to load brokers. Please try again later.')
      console.error('Failed to fetch brokers:', error)
    }
  }

  useEffect(() => {
    loadBrokers()
  }, [])

  if (error) {
    return (
      <div className='rounded-md border-2 border-zinc-700 bg-zinc-800/50 p-6 text-center'>
        <p className='text-red-300'>{error}</p>
        <button
          onClick={loadBrokers}
          className='mt-4 inline-block cursor-pointer rounded-lg bg-sky-400 px-4 py-2 font-medium text-zinc-900 hover:bg-sky-400/85'
        >
          Try Again
        </button>
      </div>
    )
  }

  if (brokers.length === 0) {
    return (
      <div className='rounded-md border-2 border-zinc-700 bg-zinc-800/50 p-6 text-center'>
        <p className='text-zinc-400'>No brokers found.</p>
      </div>
    )
  }

  return (
    <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' role='list'>
      {brokers.map(broker => (
        <BrokerItem key={broker.id} broker={broker} onDelete={loadBrokers} />
      ))}
    </ul>
  )
}
