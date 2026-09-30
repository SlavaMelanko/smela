import { describe, expect, it } from 'bun:test'

import { comparePasswordHashes, hashPassword } from '../index'

describe('password', () => {
  it('hashes a password and verifies it', async () => {
    const plainPassword = 'SecurePassword123!'
    const hashedPassword = await hashPassword(plainPassword)

    expect(hashedPassword).toBeDefined()
    expect(hashedPassword).not.toBe(plainPassword)
    expect(hashedPassword.length).toBeGreaterThan(0)

    const isValid = await comparePasswordHashes(plainPassword, hashedPassword)

    expect(isValid).toBe(true)
  })

  it('returns false for a wrong password', async () => {
    const plainPassword = 'CorrectPassword123!'
    const wrongPassword = 'WrongPassword456!'
    const hashedPassword = await hashPassword(plainPassword)

    const isValid = await comparePasswordHashes(wrongPassword, hashedPassword)

    expect(isValid).toBe(false)
  })

  it('returns false for an empty password', async () => {
    const plainPassword = 'ValidPassword123!'
    const hashedPassword = await hashPassword(plainPassword)

    const isValid = await comparePasswordHashes('', hashedPassword)

    expect(isValid).toBe(false)
  })

  it('returns false for an empty hash', async () => {
    const plainPassword = 'ValidPassword123!'

    const isValid = await comparePasswordHashes(plainPassword, '')

    expect(isValid).toBe(false)
  })

  it('produces different hashes for different passwords', async () => {
    const password1 = 'Password123!'
    const password2 = 'DifferentPassword456!'

    const hash1 = await hashPassword(password1)
    const hash2 = await hashPassword(password2)

    expect(hash1).not.toBe(hash2)
    expect(hash1).toBeDefined()
    expect(hash2).toBeDefined()
  })

  it('produces different hashes for the same password hashed twice', async () => {
    const password = 'SamePassword123!'

    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })

  it('verifies both hashes of the same password', async () => {
    const password = 'OriginalPassword123!'

    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    const isValid1 = await comparePasswordHashes(password, hash1)
    const isValid2 = await comparePasswordHashes(password, hash2)

    expect(isValid1).toBe(true)
    expect(isValid2).toBe(true)
  })

  it('hashes and verifies very long passwords', async () => {
    const longPassword = 'a'.repeat(200)
    const hashedPassword = await hashPassword(longPassword)

    const isValid = await comparePasswordHashes(longPassword, hashedPassword)

    expect(isValid).toBe(true)
  })

  it('hashes and verifies passwords with special characters', async () => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const hashedPassword = await hashPassword(specialPassword)

    const isValid = await comparePasswordHashes(specialPassword, hashedPassword)

    expect(isValid).toBe(true)
  })

  it('hashes and verifies passwords with unicode characters', async () => {
    const unicodePassword = 'Пароль123!😀🔐'
    const hashedPassword = await hashPassword(unicodePassword)

    const isValid = await comparePasswordHashes(unicodePassword, hashedPassword)

    expect(isValid).toBe(true)
  })
})
