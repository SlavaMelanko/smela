import type RandomBytesGenerator from './random-bytes-generator'

import NodeRandomBytesGenerator from './random-bytes-generator-node'

export const createRandomBytesGenerator = (): RandomBytesGenerator =>
  new NodeRandomBytesGenerator()
