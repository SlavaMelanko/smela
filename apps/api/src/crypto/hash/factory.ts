import type Hasher from './hasher'

import BcryptHasher from './hasher-bcrypt'
import NodeHasher from './hasher-node'

type Algorithm = 'bcrypt' | 'sha256' | 'sha512'

const hasherMap: Record<Algorithm, () => Hasher> = {
  bcrypt: () => new BcryptHasher(),
  sha256: () => new NodeHasher('sha256'),
  sha512: () => new NodeHasher('sha512')
}

export const createHasher = (algorithm: Algorithm = 'bcrypt'): Hasher =>
  hasherMap[algorithm]()
