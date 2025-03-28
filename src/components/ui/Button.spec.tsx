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
    expect(button).toHaveClass('bg-sky-400')
  })

  it('renders with outline variant', () => {
    setup({ variant: 'outline' })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('border-zinc-700')
  })

  it('renders with ghost variant', () => {
    setup({ variant: 'ghost' })
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-transparent')
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
})
