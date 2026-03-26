import type Hasher from './hasher'

class BcryptHasher implements Hasher {
  private readonly saltRounds: number

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds
  }

  async hash(plain: string): Promise<string> {
    return Bun.password.hash(plain, { algorithm: 'bcrypt', cost: this.saltRounds })
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return Bun.password.verify(plain, hashed)
  }
}

export default BcryptHasher
