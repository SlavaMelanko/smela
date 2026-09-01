import { describe, expect, it } from 'bun:test'

import {
  DescriptionConstraint,
  EmailConstraint,
  NameConstraint,
  PasswordConstraint,
  PositionConstraint,
  SvgConstraint,
  WebsiteConstraint
} from '../constraints'

describe('NameConstraint', () => {
  it('exposes the expected bounds', () => {
    expect(NameConstraint.MIN_LENGTH).toBe(2)
    expect(NameConstraint.MAX_LENGTH).toBe(50)
  })
})

describe('PositionConstraint', () => {
  it('exposes a max with no minimum', () => {
    expect(PositionConstraint.MAX_LENGTH).toBe(100)
    expect('MIN_LENGTH' in PositionConstraint).toBe(false)
  })
})

describe('WebsiteConstraint', () => {
  it('exposes the expected bound', () => {
    expect(WebsiteConstraint.MAX_LENGTH).toBe(255)
  })
})

describe('DescriptionConstraint', () => {
  it('exposes the expected bound', () => {
    expect(DescriptionConstraint.MAX_LENGTH).toBe(500)
  })
})

describe('SvgConstraint', () => {
  it('exposes the expected bounds', () => {
    expect(SvgConstraint.MIN_LENGTH).toBe(1)
    expect(SvgConstraint.MAX_LENGTH).toBe(10_000)
  })
})

describe('PasswordConstraint.STRONG', () => {
  it.each([
    ['Passw0rd!', true],
    ['ALLCAPS1!', true],
    ['Ab1!efgh', true],
    ['noupper1!', true],
    ['NOLOWER1!', true],
    ['NoDigits!', false],
    ['NoSpecial1', false],
    ['Ab1!', true]
  ])('%s -> %s', (value, expected) => {
    expect(PasswordConstraint.STRONG.test(value)).toBe(expected)
  })
})

describe('EmailConstraint.STANDARD', () => {
  it.each([
    ['user@example.com', true],
    ['first.last+tag@sub.example.co', true],
    ['no-at-sign.com', false],
    ['.leading@example.com', false],
    ['double..dot@example.com', false],
    ['missing-domain@', false],
    ['trailing-dot@example.com.', false]
  ])('%s -> %s', (value, expected) => {
    expect(EmailConstraint.STANDARD.test(value)).toBe(expected)
  })
})
