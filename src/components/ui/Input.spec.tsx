import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

const setup = (props = {}) => {
  const user = userEvent.setup()
  const utils = render(<Input {...props} />)
  return {
    user,
    ...utils
  }
}

describe('Input', () => {
  it('renders input element', () => {
    setup()
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('renders with label when provided', () => {
    setup({ label: 'Username' })
    const label = screen.getByText('Username')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('connects label to input via htmlFor', () => {
    setup({ label: 'Username' })
    const label = screen.getByText('Username')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', input.id)
  })

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required'
    setup({ error: errorMessage })
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('applies error styles when error prop is provided', () => {
    setup({ error: 'Error message' })
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-400')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies fullWidth class when fullWidth prop is true', () => {
    setup({ fullWidth: true })
    const container = screen.getByRole('textbox').parentElement
    expect(container).toHaveClass('w-full')
  })

  it('forwards additional props to input element', () => {
    setup({ placeholder: 'Enter username', type: 'email' })
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter username')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('merges custom className with default classes', () => {
    setup({ className: 'custom-class' })
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('w-full')
  })

  it('handles user input correctly', async () => {
    const { user } = setup()
    const input = screen.getByRole('textbox')

    await user.type(input, 'test@example.com')

    expect(input).toHaveValue('test@example.com')
  })

  it('sets aria-describedby when error is present', () => {
    const errorId = 'input-error'
    setup({ error: 'Error message', id: 'input' })
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', errorId)
  })
})
