import { describe, expect, it } from 'bun:test'

import { BcryptHasher } from '../hasher-bcrypt'

describe('BcryptHasher', () => {
  const hasher = new BcryptHasher()

  it('hashes a string in bcrypt format', async () => {
    const plainText = 'password123'
    const hashedText = await hasher.hash(plainText)

    expect(hashedText).toBeDefined()
    expect(hashedText).not.toBe(plainText)
    expect(hashedText.length).toBeGreaterThan(50)
    expect(hashedText.startsWith('$2b$12$')).toBe(true)
  })

  it('produces different hashes for the same string due to salt', async () => {
    const plainText = 'sameText'
    const hash1 = await hasher.hash(plainText)
    const hash2 = await hasher.hash(plainText)

    expect(hash1).not.toBe(hash2)
  })

  it('returns true for matching text', async () => {
    const plainText = 'testPassword123'
    const hashedText = await hasher.hash(plainText)

    const isMatch = await hasher.compare(plainText, hashedText)

    expect(isMatch).toBe(true)
  })

  it('verifies hashes made with a lower cost', async () => {
    const plainText = 'legacyPassword123'
    const legacyHash = await new BcryptHasher(10).hash(plainText)

    expect(await hasher.compare(plainText, legacyHash)).toBe(true)
  })

  it('returns false for non-matching text', async () => {
    const plainText = 'testPassword123'
    const wrongText = 'wrongPassword456'
    const hashedText = await hasher.hash(plainText)

    const isMatch = await hasher.compare(wrongText, hashedText)

    expect(isMatch).toBe(false)
  })

  it('hashes with custom salt rounds', async () => {
    const hasher10 = new BcryptHasher(10)
    const plainText = 'password123'
    const hashedText = await hasher10.hash(plainText)

    expect(hashedText).toBeDefined()
    expect(hashedText).not.toBe(plainText)
    expect(hashedText.startsWith('$2b$10$')).toBe(true)
  })
})
