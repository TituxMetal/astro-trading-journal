import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

const setup = (props = {}) => {
  const user = userEvent.setup()
  const utils = render(<Button {...props}>Click me</Button>)
  return {
    user,
    ...utils
  }
}

describe('Button', () => {
  it('renders with default variant', () => {
    setup()
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-sky-400', 'text-zinc-900')
  })

  it('renders with outline variant', () => {
    setup({ variant: 'outline' })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-transparent', 'border-zinc-700', 'text-zinc-300')
  })

  it('renders with ghost variant', () => {
    setup({ variant: 'ghost' })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-transparent', 'text-zinc-300')
  })

  it('renders with destructive variant', () => {
    setup({ variant: 'destructive' })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-red-900', 'text-red-300')
  })

  it('applies disabled styles when disabled', () => {
    setup({ disabled: true })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('cursor-not-allowed')
  })

  it('forwards additional props', () => {
    setup({ 'data-testid': 'test-button' })
    expect(screen.getByTestId('test-button')).toBeInTheDocument()
  })

  it('merges custom className with default classes', () => {
    setup({ className: 'custom-class' })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('w-fit')
  })

  it('handles click events', async () => {
    const onClick = vi.fn()
    const { user } = setup({ onClick })

    await user.click(screen.getByRole('button', { name: /click me/i }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not trigger click when disabled', async () => {
    const onClick = vi.fn()
    const { user } = setup({ onClick, disabled: true })

    await user.click(screen.getByRole('button', { name: /click me/i }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('can render as an anchor', () => {
    render(
      <Button as='a' href='/test'>
        Link
      </Button>
    )

    const link = screen.getByRole('link', { name: 'Link' })

    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('bg-sky-400', 'text-zinc-900')
  })
})
