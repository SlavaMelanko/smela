import { describe, expect, it } from 'bun:test'

import { isHttpsUrl } from '../url'

describe('isHttpsUrl', () => {
  it.each([
    ['https://example.com', true],
    ['https://sub.example.com/path?q=1#hash', true],
    ['https:example.com', false],
    ['http://example.com', false],
    ['ftp://example.com', false],
    ['example.com', false],
    ['https://', false],
    ['', false]
  ])('%s -> %s', (value, expected) => {
    expect(isHttpsUrl(value)).toBe(expected)
  })
})
