import { toQueryStr, withQuery } from '../url'

describe('toQueryStr', () => {
  it('serializes false and empty string', () => {
    expect(toQueryStr({ a: false, b: '' })).toBe('a=false&b=')
  })

  it('serializes reset-password params', () => {
    const params = {
      email: 'user@example.com',
      oobCode: 'AbCdEf1234567890'
    }

    expect(toQueryStr(params)).toBe(
      'email=user%40example.com&oobCode=AbCdEf1234567890'
    )
  })

  it('serializes verify-email params', () => {
    const params = {
      oobCode: 'ZYXWVUT987654321'
    }

    expect(toQueryStr(params)).toBe('oobCode=ZYXWVUT987654321')
  })

  it('skips null/undefined values', () => {
    const params = {
      email: null,
      oobCode: 'CODE'
    }

    expect(toQueryStr(params)).toBe('oobCode=CODE')
  })
})

describe('withQuery', () => {
  it('handles null/undefined values', () => {
    expect(withQuery('/foo', { a: null, b: 2 })).toBe('/foo?b=2')
  })

  it('encodes special characters', () => {
    expect(withQuery('/foo', { q: 'a b&c' })).toBe('/foo?q=a+b%26c')
  })

  it('creates /reset-password with email and oobCode', () => {
    const path = '/reset-password'
    const params = {
      email: 'user@example.com',
      oobCode: 'AbCdEf1234567890'
    }

    expect(withQuery(path, params)).toBe(
      '/reset-password?email=user%40example.com&oobCode=AbCdEf1234567890'
    )
  })

  it('creates /verify-email with oobCode', () => {
    const path = '/verify-email'
    const params = {
      oobCode: 'ZYXWVUT987654321'
    }

    expect(withQuery(path, params)).toBe(
      '/verify-email?oobCode=ZYXWVUT987654321'
    )
  })

  it('handles missing email for /reset-password', () => {
    const path = '/reset-password'
    const params = {
      email: null,
      oobCode: 'AbCdEf1234567890'
    }

    expect(withQuery(path, params)).toBe(
      '/reset-password?oobCode=AbCdEf1234567890'
    )
  })
})
