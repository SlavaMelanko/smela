import {
  createToken,
  deprecateOldTokens,
  deprecateTeamInviteTokens,
  issueToken,
  updateToken
} from './mutations'
import { findByTokenHash } from './queries'

export * from './types'

export const tokenRepo = {
  create: createToken,
  issue: issueToken,
  deprecate: deprecateOldTokens,
  deprecateTeamInvites: deprecateTeamInviteTokens,
  findByHash: findByTokenHash,
  update: updateToken
}
