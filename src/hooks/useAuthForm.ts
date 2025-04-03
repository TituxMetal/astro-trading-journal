import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authSchema, type AuthSchema } from '~/schemas/auth.schema'
import type { ApiResponse } from '~/services/api/utils'
import type { AuthMode } from '~/types/auth.types'

export type AuthenticateFunction = (
  data: AuthSchema,
  mode: AuthMode
) => Promise<ApiResponse<{ id: string; username: string }>>

export const useAuthForm = (mode: AuthMode, onAuthenticate: AuthenticateFunction) => {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<AuthSchema>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: '',
      password: ''
    },
    mode: 'onTouched',
    criteriaMode: 'all'
  })

  const handleSubmit = async (data: AuthSchema) => {
    setServerError(null)

    const result = await onAuthenticate(data, mode)

    if (!result.success) {
      setServerError(result.message || 'Authentication failed')
    }

    if (result.success && typeof window !== 'undefined') {
      setServerError(null)
      form.reset()
      window.location.href = '/'
    }

    return result
  }

  return {
    form,
    serverError,
    isError: form.formState.isSubmitted && !form.formState.isValid,
    handleSubmit: form.handleSubmit(handleSubmit)
  }
}
