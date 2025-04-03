import type { Broker } from '@prisma/client'
import { Button } from './ui/Button'

interface BrokerItemProps {
  broker: Broker
  onDelete: () => Promise<void>
}

export const BrokerItem = ({ broker, onDelete }: BrokerItemProps) => {
  const handleDelete = async () => {
    await fetch(`/api/brokers/${broker.id}`, {
      method: 'DELETE'
    })
    await onDelete()
  }

  return (
    <li className='mb-4 rounded-md border-2 border-zinc-600 bg-zinc-800/50 p-4'>
      <section className='flex flex-col gap-2'>
        <h2 className='text-xl font-semibold'>{broker.name}</h2>
        <p className='text-zinc-300'>Account Number: {broker.accountNumber || 'N/A'}</p>
        <p className='text-zinc-300'>Currency: {broker.currency}</p>

        <nav className='mt-2 flex gap-2' role='toolbar'>
          <Button as='a' href={`/brokers/${broker.id}/edit`} variant='outline'>
            Edit
          </Button>
          <Button onClick={handleDelete} variant='destructive'>
            Delete
          </Button>
        </nav>
      </section>
    </li>
  )
}
