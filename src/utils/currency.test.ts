import { describe, expect, it } from 'vitest'
import { parseCurrencyInputToCents } from './currency'

describe('currency parsing', () => {
  it('accepts decimal comma and point', () => {
    expect(parseCurrencyInputToCents('20,50')).toBe(2050)
    expect(parseCurrencyInputToCents('20.50')).toBe(2050)
  })

  it('parses integer input to exact cents', () => {
    expect(parseCurrencyInputToCents('5')).toBe(500)
    expect(parseCurrencyInputToCents('5.5')).toBe(550)
    expect(parseCurrencyInputToCents('0.1')).toBe(10)
  })

  it('rejects empty, invalid or negative amounts', () => {
    expect(parseCurrencyInputToCents('')).toBeNull()
    expect(parseCurrencyInputToCents('-3')).toBeNull()
    expect(parseCurrencyInputToCents('abc')).toBeNull()
  })
})
