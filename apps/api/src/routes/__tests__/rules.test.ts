import { describe, expect, it } from 'bun:test'

import { Resource } from '@/types'

import { rules } from '../rules'

describe('rules.permissions', () => {
  it('accepts true for both flags', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: true, manage: true }
    })

    expect(result[Resource.Users]).toEqual({ view: true, manage: true })
  })

  it('accepts false for both flags', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: false, manage: false }
    })

    expect(result[Resource.Users]).toEqual({ view: false, manage: false })
  })

  it('accepts mixed true and false flags', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: true, manage: false }
    })

    expect(result[Resource.Users]).toEqual({ view: true, manage: false })
  })

  it('coerces null view to false', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: null, manage: true }
    })

    expect(result[Resource.Users]).toEqual({ view: false, manage: true })
  })

  it('coerces null manage to false', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: true, manage: null }
    })

    expect(result[Resource.Users]).toEqual({ view: true, manage: false })
  })

  it('coerces both null flags to false', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: null, manage: null }
    })

    expect(result[Resource.Users]).toEqual({ view: false, manage: false })
  })

  it('coerces undefined view to false', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { manage: true }
    })

    expect(result[Resource.Users]).toEqual({ view: false, manage: true })
  })

  it('coerces undefined manage to false', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: true }
    })

    expect(result[Resource.Users]).toEqual({ view: true, manage: false })
  })

  it('coerces both undefined flags to false', () => {
    const result = rules.permissions.parse({ [Resource.Users]: {} })

    expect(result[Resource.Users]).toEqual({ view: false, manage: false })
  })

  it('allows a resource to be omitted when others are present', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: true, manage: false }
    })

    expect(result[Resource.Teams]).toBeUndefined()
  })

  it('allows partial coverage across multiple resources', () => {
    const result = rules.permissions.parse({
      [Resource.Users]: { view: true, manage: false },
      [Resource.Teams]: { view: null }
    })

    expect(result[Resource.Users]).toEqual({ view: true, manage: false })
    expect(result[Resource.Teams]).toEqual({ view: false, manage: false })
    expect(result[Resource.Admins]).toBeUndefined()
  })

  it('rejects an empty object with no resources', () => {
    expect(() => rules.permissions.parse({})).toThrow()
  })

  it('rejects a non-boolean view value', () => {
    expect(() =>
      rules.permissions.parse({
        [Resource.Users]: { view: 'yes', manage: true }
      })
    ).toThrow()
  })

  it('rejects a non-boolean manage value', () => {
    expect(() =>
      rules.permissions.parse({ [Resource.Users]: { view: true, manage: 1 } })
    ).toThrow()
  })

  it('rejects a non-object resource value', () => {
    expect(() =>
      rules.permissions.parse({ [Resource.Users]: 'read' })
    ).toThrow()
  })
})

describe('rules.user.nickname', () => {
  it('trims Unicode labels without requiring uniqueness or handle syntax', () => {
    expect(rules.user.nickname.parse('  Слава 🌻  ')).toBe('Слава 🌻')
  })

  it('rejects empty, null, whitespace-only, and overlong nicknames', () => {
    for (const value of ['', null, '   ', 'a'.repeat(51)]) {
      expect(rules.user.nickname.safeParse(value).success).toBe(false)
    }
  })

  it('accepts the minimum and maximum lengths', () => {
    expect(rules.user.nickname.parse('A')).toBe('A')
    expect(rules.user.nickname.parse('a'.repeat(50))).toHaveLength(50)
  })
})

describe('rules.user.name', () => {
  it('is required by default and trims valid names', () => {
    for (const value of [undefined, null, '', '  ', 'a'.repeat(51)]) {
      expect(rules.user.name.safeParse(value).success).toBe(false)
    }
    expect(rules.user.name.parse(' Slava ')).toBe('Slava')
  })

  it('allows clearing with null only when consumers opt in with nullish', () => {
    expect(rules.user.name.nullish().parse(null)).toBeNull()
    expect(rules.user.name.nullish().parse(undefined)).toBeUndefined()
    expect(rules.user.name.nullish().safeParse('').success).toBe(false)
  })
})
