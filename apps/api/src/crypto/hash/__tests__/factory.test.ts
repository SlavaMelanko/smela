import { describe, expect, it } from 'bun:test'

import { createHasher } from '../factory'

describe('createHasher', () => {
  const plainText = 'password123'

  it('creates a bcrypt hasher by default', async () => {
    const hasher = createHasher()

    const hashedText = await hasher.hash(plainText)

    expect(hashedText).toMatch(/^\$2[aby]\$/)
    expect(await hasher.compare(plainText, hashedText)).toBe(true)
  })

  it.each([
    ['sha256', 64],
    ['sha512', 128]
  ] as const)('creates a %s hasher', async (algorithm, hexLength) => {
    const hasher = createHasher(algorithm)

    const hashedText = await hasher.hash(plainText)

    expect(hashedText).toMatch(new RegExp(`^[0-9a-f]{${hexLength}}$`))
    expect(await hasher.compare(plainText, hashedText)).toBe(true)
  })
})
