import { useBrokerForm } from '~/hooks/useBrokerForm'
import { type CreateBrokerSchema } from '~/schemas/broker.schema'
import { createBroker, updateBroker } from '~/services/api/broker'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface BrokerFormProps {
  defaultValues?: Partial<CreateBrokerSchema>
  mode?: 'create' | 'edit'
  brokerId?: string
}

export const BrokerForm = ({ defaultValues, mode = 'create', brokerId }: BrokerFormProps) => {
  const submitHandler = (data: CreateBrokerSchema) => {
    if (mode === 'edit') {
      if (!brokerId) {
        throw new Error('Broker ID is required for edit mode')
      }

      return updateBroker(brokerId!, data)
    }
    return createBroker(data)
  }

  const { form, serverError, handleSubmit, isError, isSubmitting } = useBrokerForm(
    defaultValues ?? {},
    submitHandler
  )

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {serverError && (
        <p className='rounded-md bg-red-800/80 p-3 font-bold text-red-300' role='alert'>
          {serverError}
        </p>
      )}

      <div className='space-y-4'>
        <Input
          label='Name'
          {...form.register('name')}
          error={form.formState.errors.name?.message}
          placeholder='e.g. Interactive Brokers'
        />
        <Input
          label='Account Number'
          {...form.register('accountNumber')}
          error={form.formState.errors.accountNumber?.message}
          placeholder='e.g. U123456789'
        />
        <Input
          label='Currency'
          {...form.register('currency')}
          error={form.formState.errors.currency?.message}
          placeholder='e.g. USD'
        />
      </div>

      <Button type='submit' disabled={isSubmitting || isError}>
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Broker' : 'Update Broker'}
      </Button>
    </form>
  )
}
