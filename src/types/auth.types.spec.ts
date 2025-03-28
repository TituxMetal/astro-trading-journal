import { describe, expect, it } from 'vitest'
import { AUTH_MODES, isValidAuthMode } from './auth.types'

describe('isValidAuthMode', () => {
  it('returns true for valid auth modes', () => {
    const result = AUTH_MODES.every(mode => isValidAuthMode(mode))

    expect(result).toBe(true)
  })

  it('returns false for invalid string values', () => {
    const invalidModes = ['admin', 'register', '', ' login', 'LOGIN']

    const result = invalidModes.every(mode => !isValidAuthMode(mode))

    expect(result).toBe(true)
  })

  it('returns false for non-string values', () => {
    const invalidValues = [null, undefined, 123, true, {}, [], () => {}]

    const result = invalidValues.every(value => !isValidAuthMode(value))

    expect(result).toBe(true)
  })
})
