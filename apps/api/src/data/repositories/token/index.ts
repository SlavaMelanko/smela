import {
  createToken,
  deprecateOldTokens,
  issueToken,
  updateToken
} from './mutations'
import { findByTokenHash } from './queries'

export * from './types'

export const tokenRepo = {
  create: createToken,
  issue: issueToken,
  deprecate: deprecateOldTokens,
  findByHash: findByTokenHash,
  update: updateToken
}
