import { datePreset, formatDate, timeSince } from '../date'

describe('timeSince', () => {
  it('returns seconds for a date 30 seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000)

    expect(timeSince(date)).toMatchObject({
      seconds: 30,
      minutes: 0,
      hours: 0,
      days: 0
    })
  })

  it('returns minutes for a date 5 minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)

    expect(timeSince(date)).toMatchObject({ minutes: 5, hours: 0, days: 0 })
  })

  it('returns hours for a date 3 hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)

    expect(timeSince(date)).toMatchObject({ hours: 3, days: 0 })
  })

  it('returns days for a date 7 days ago', () => {
    const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    expect(timeSince(date)).toMatchObject({ days: 7 })
  })

  it('accepts an ISO string', () => {
    const date = new Date(Date.now() - 60 * 1000)

    expect(timeSince(date.toISOString())).toMatchObject({ minutes: 1 })
  })

  it('accepts a timestamp', () => {
    const date = Date.now() - 60 * 1000

    expect(timeSince(date)).toMatchObject({ minutes: 1 })
  })
})

describe('formatDate', () => {
  const testDate = '2025-07-04T00:00:00Z'

  it.each([null, undefined])('returns empty string for %s input', value => {
    expect(formatDate(value)).toBe('')
  })

  it.each([
    ['en', '07/04/2025'],
    ['uk', '04.07.2025']
  ])('formats date with numeric preset in %s locale', (locale, expected) => {
    expect(formatDate(testDate, locale)).toBe(expected)
  })

  it.each([
    ['en', 'Jul 4, 2025'],
    ['uk', '4 лип. 2025 р.']
  ])('formats date with short preset in %s locale', (locale, expected) => {
    expect(formatDate(testDate, locale, datePreset.short)).toBe(expected)
  })

  it.each([
    ['en', 'Friday, July 4, 2025'],
    ['uk', /4 липня 2025/]
  ])('formats date with full preset in %s locale', (locale, expected) => {
    expect(formatDate(testDate, locale, datePreset.full)).toMatch(expected)
  })

  it('formats date with custom options', () => {
    const formatted = formatDate(testDate, 'en', {
      weekday: 'short',
      month: 'long'
    })

    expect(formatted).toContain('Jul')
  })

  it('formats Date object input', () => {
    const dateObj = new Date(testDate)
    const formatted = formatDate(dateObj, 'en')

    expect(formatted).toBe('07/04/2025')
  })

  it('formats timestamp input', () => {
    const timestamp = Date.parse(testDate)
    const formatted = formatDate(timestamp, 'en')

    expect(formatted).toBe('07/04/2025')
  })
})
