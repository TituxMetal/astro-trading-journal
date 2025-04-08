import { zodResolver } from '@hookform/resolvers/zod'
import type { Broker } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createBrokerSchema, type CreateBrokerSchema } from '~/schemas/broker.schema'
import type { ApiResponse } from '~/services/api/utils'

export type BrokerSubmitFunction = (data: CreateBrokerSchema) => Promise<ApiResponse<Broker>>

export const useBrokerForm = (
  defaultValues: Partial<CreateBrokerSchema>,
  onSubmit: BrokerSubmitFunction
) => {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<CreateBrokerSchema>({
    resolver: zodResolver(createBrokerSchema),
    defaultValues: {
      name: '',
      accountNumber: '',
      currency: '',
      ...defaultValues
    },
    mode: 'onTouched',
    criteriaMode: 'all'
  })

  useEffect(() => {
    form.reset({
      name: '',
      accountNumber: '',
      currency: '',
      ...defaultValues
    })
  }, [])

  const handleSubmit = async (data: CreateBrokerSchema) => {
    setServerError(null)

    const result = await onSubmit(data)

    if (!result.success) {
      setServerError(result.message || 'Failed to save broker')
    }

    if (result.success && typeof window !== 'undefined') {
      setServerError(null)
      form.reset()
      window.location.href = '/brokers'
    }

    return result
  }

  return {
    form,
    serverError,
    isError: form.formState.isSubmitted && !form.formState.isValid,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: form.formState.isSubmitting
  }
}
