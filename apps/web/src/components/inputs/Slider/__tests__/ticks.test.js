import { generateTicks } from '../ticks'

describe('generateTicks', () => {
  it('returns 2 ticks (min, max) by default', () => {
    expect(generateTicks(0, 1000, 2)).toEqual([0, 1000])
  })

  it('returns 3 ticks (min, mid, max)', () => {
    expect(generateTicks(0, 1000, 3)).toEqual([0, 500, 1000])
  })

  it('returns evenly distributed ticks for custom count', () => {
    expect(generateTicks(0, 1000, 5)).toEqual([0, 250, 500, 750, 1000])
  })

  it('floors mid value when min is not zero', () => {
    expect(generateTicks(1, 1000, 3)).toEqual([1, 500, 1000])
  })
})
