import { createHasher, createRandomBytesGenerator } from '@/crypto'

export const hashPassword = async (password: string): Promise<string> => {
  const hasher = createHasher()

  return hasher.hash(password)
}

export const generatePasswordHash = async (length = 32): Promise<string> => {
  const generator = createRandomBytesGenerator()
  const password = generator.generate(length)

  return hashPassword(password)
}

let dummyHash: Promise<string> | undefined

/**
 * Hash of a random password at the real cost, created once on first use.
 * Comparing against it makes a login for an unknown account take as long as
 * a wrong password, so response time doesn't reveal which emails exist
 */
export const getDummyPasswordHash = async () =>
  (dummyHash ??= generatePasswordHash())

export const comparePasswordHashes = async (
  password: string,
  hash: string
): Promise<boolean> => {
  if (!password || !hash) {
    return false
  }

  const hasher = createHasher()

  return hasher.compare(password, hash)
}
