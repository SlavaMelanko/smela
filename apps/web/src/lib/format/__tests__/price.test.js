import { formatPrice } from '../price'

describe('formatPrice', () => {
  it('formats USD in en locale', () => {
    expect(formatPrice(0, 'en', 'USD')).toBe('$0.00')
    expect(formatPrice(99.99, 'en', 'USD')).toBe('$99.99')
    expect(formatPrice(1000, 'en', 'USD')).toBe('$1,000.00')
  })

  it('formats USD in uk locale with custom symbol', () => {
    expect(formatPrice(0, 'uk', 'USD')).toBe('0,00$')
    expect(formatPrice(99.99, 'uk', 'USD')).toBe('99,99$')
    // \u00A0 is the Unicode escape sequence for a non-breaking space
    expect(formatPrice(1000, 'uk', 'USD')).toBe('1\u00A0000,00$')
  })

  it('respects currency and options', () => {
    expect(formatPrice(0, 'en', 'EUR')).toBe('€0.00')
    expect(formatPrice(99.99, 'en', 'EUR')).toBe('€99.99')
    expect(formatPrice(1000, 'en', 'EUR')).toBe('€1,000.00')
  })
})
