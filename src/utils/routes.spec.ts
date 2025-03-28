import { describe, expect, it } from 'vitest'
import { routes } from './routes'

describe('routes.auth', () => {
  it('returns correct path', () => {
    const path = routes.auth.path

    expect(path).toBe('/auth')
  })

  it('generates correct URL for login mode', () => {
    const url = routes.auth.getUrl('login')

    expect(url).toBe('/auth?mode=login')
  })

  it('generates correct URL for signup mode', () => {
    const url = routes.auth.getUrl('signup')

    expect(url).toBe('/auth?mode=signup')
  })

  it('returns correct opposite mode for login', () => {
    const oppositeMode = routes.auth.getOppositeMode('login')

    expect(oppositeMode).toBe('signup')
  })

  it('returns correct opposite mode for signup', () => {
    const oppositeMode = routes.auth.getOppositeMode('signup')

    expect(oppositeMode).toBe('login')
  })

  it('generates correct opposite mode URL for login', () => {
    const url = routes.auth.getOppositeModeUrl('login')

    expect(url).toBe('/auth?mode=signup')
  })

  it('generates correct opposite mode URL for signup', () => {
    const url = routes.auth.getOppositeModeUrl('signup')

    expect(url).toBe('/auth?mode=login')
  })

  it('is immutable', () => {
    expect(() => {
      // @ts-expect-error - Should not allow modification of path
      routes.auth.path = '/new-path'
    }).toThrow()

    expect(routes.auth.path).toBe('/auth')

    expect(() => {
      // @ts-expect-error - Should not allow modification of methods
      routes.auth.getUrl = () => '/new-url'
    }).toThrow()

    expect(routes.auth.getUrl('login')).toBe('/auth?mode=login')
  })
})
