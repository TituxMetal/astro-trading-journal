import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef } from 'react'

type InputProps = {
  label?: string
  error?: string | string[]
  name: string // Make name required to derive other values from it
  type?: string // Make type optional with text as default
  description?: string // Optional description text for additional context
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'name'> // Omit these since we're handling them specially

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, description, className = '', id, name, type = 'text', required, ...rest },
    ref
  ) => {
    // Process error to handle both string and array formats
    const hasError = !!error
    const errorMessage = Array.isArray(error) ? error.join(', ') : error

    // Use name for id if not provided
    const inputId = id || name
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = `${inputId}-error`

    // Combine aria-describedby with both description and error IDs when present
    const ariaDescribedBy =
      [descriptionId, hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined

    // Base styles
    const baseInputClasses =
      'w-full rounded-lg border-2 bg-zinc-900 px-3 py-2 text-zinc-300 focus:outline-none'
    const borderClasses = hasError
      ? 'border-red-400 focus:border-red-400'
      : 'border-zinc-700 focus:border-amber-400'
    const inputClasses = `${baseInputClasses} ${borderClasses} ${className}`

    return (
      <>
        {label && (
          <label htmlFor={inputId} className='flex font-medium text-zinc-300'>
            <span>{label}</span>
            {required && (
              <span className='ml-1 text-red-400' aria-hidden='true'>
                *
              </span>
            )}
          </label>
        )}

        {description && (
          <p id={descriptionId} className='text-sm text-zinc-400'>
            {description}
          </p>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
          required={required}
          {...rest}
        />

        {hasError && (
          <p id={errorId} className='mt-2 font-semibold text-red-400' role='alert'>
            {errorMessage}
          </p>
        )}
      </>
    )
  }
)

Input.displayName = 'Input'

export default Input
