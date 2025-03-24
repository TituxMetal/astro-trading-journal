import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef } from 'react'

type ButtonVariant = 'default' | 'outline' | 'ghost'

type ButtonProps = {
  variant?: ButtonVariant
} & ComponentPropsWithoutRef<'button'>

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', className = '', ...rest }, ref) => {
    const baseClasses =
      'w-fit rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-70 transition-colors'

    const variantClasses = {
      default: 'bg-sky-400 text-zinc-900 hover:bg-sky-400/85 border-2 border-transparent',
      outline: 'bg-transparent border-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800',
      ghost:
        'bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200 border-2 border-transparent'
    }

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`

    return (
      <button ref={ref} className={combinedClasses} {...rest}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
