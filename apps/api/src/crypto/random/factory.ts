import type RandomBytesGenerator from './random-bytes-generator'

import NodeRandomBytesGenerator from './random-bytes-generator-node'

export const createRandomBytesGenerator = (
  impl: 'node' = 'node'
): RandomBytesGenerator => {
  if (impl === 'node') {
    return new NodeRandomBytesGenerator()
  }

  throw new Error(`Unknown random bytes generator: ${impl as string}`)
}
