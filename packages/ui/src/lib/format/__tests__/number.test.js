import { formatNumber } from '../number'

describe('formatNumber', () => {
  it('formats large number in English locale', () => {
    expect(formatNumber(1234567.89, 'en')).toBe('1,234,567.89')
  })

  it('formats large number in Ukrainian locale', () => {
    expect(formatNumber(1234567.89, 'uk')).toBe('1 234 567,89') // uses non-breaking spaces
  })

  it('formats zero', () => {
    expect(formatNumber(0, 'en')).toBe('0')
    expect(formatNumber(0, 'uk')).toBe('0')
  })

  it('handles null gracefully', () => {
    expect(formatNumber(null, 'en')).toBe('0')
  })

  it('handles undefined gracefully', () => {
    expect(formatNumber(undefined, 'en')).toBe('NaN')
  })
})
