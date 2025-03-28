import { useAuthForm } from '~/hooks/useAuthForm'
import { authenticateUser } from '~/services/api.service'
import type { AuthMode } from '~/types/auth.types'
import { routes } from '~/utils/routes'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface AuthFormProps {
  mode?: AuthMode
  onAuthenticate?: typeof authenticateUser
}

export const AuthForm = ({ mode = 'login', onAuthenticate = authenticateUser }: AuthFormProps) => {
  const { form, serverError, isError, handleSubmit } = useAuthForm(mode, onAuthenticate)

  return (
    <form onSubmit={handleSubmit} className='mx-auto mt-6 grid w-full max-w-md gap-4'>
      {serverError && (
        <p className='rounded-md bg-red-800/80 p-3 font-bold text-red-300' role='alert'>
          {serverError}
        </p>
      )}
      <Input
        {...form.register('username')}
        label='Username'
        placeholder='Enter your username'
        error={form.formState.errors.username?.message}
        autoComplete='username'
      />

      <Input
        {...form.register('password')}
        type='password'
        label='Password'
        placeholder='Enter your password'
        error={form.formState.errors.password?.message}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />

      <div className='flex items-center justify-between'>
        <Button type='submit' disabled={isError}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Button>

        <a
          href={routes.auth.getOppositeModeUrl(mode)}
          className='font-semibold text-amber-200 hover:text-amber-300'
        >
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </a>
      </div>
    </form>
  )
}
