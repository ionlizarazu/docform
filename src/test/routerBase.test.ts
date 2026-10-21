import { describe, expect, it } from 'vitest'
import { routerBasename } from '../app/routerBase'

describe('routerBasename', () => {
  it('keeps the root path at the root', () => {
    expect(routerBasename('/')).toBe('/')
  })

  it('strips a trailing slash from a project base', () => {
    expect(routerBasename('/docform/')).toBe('/docform')
  })

  it('accepts a base without a trailing slash', () => {
    expect(routerBasename('/docform')).toBe('/docform')
  })

  it('normalizes multiple trailing slashes', () => {
    expect(routerBasename('/docform///')).toBe('/docform')
  })
})
