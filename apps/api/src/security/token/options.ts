import { env } from '@/env'

import { TokenType } from './types'

export const TOKEN_LENGTH = 64

export const DEFAULT_EXPIRY_SECONDS = 86400 // 24 hours
export const EMAIL_VERIFICATION_EXPIRY_SECONDS = 86400 // 24 hours
export const PASSWORD_RESET_EXPIRY_SECONDS = 3600 // 1 hour
export const USER_INVITATION_EXPIRY_SECONDS = 86400 // 24 hours

export interface Options {
  expirySeconds?: number
  tokenLength?: number
}

const defaultOptionsMap: Record<TokenType, Required<Options>> = {
  [TokenType.EmailVerification]: {
    expirySeconds: EMAIL_VERIFICATION_EXPIRY_SECONDS,
    tokenLength: TOKEN_LENGTH
  },
  [TokenType.PasswordReset]: {
    expirySeconds: PASSWORD_RESET_EXPIRY_SECONDS,
    tokenLength: TOKEN_LENGTH
  },
  [TokenType.RefreshToken]: {
    expirySeconds: env.COOKIE_REFRESH_TOKEN_EXPIRATION,
    tokenLength: TOKEN_LENGTH
  },
  [TokenType.UserInvite]: {
    expirySeconds: USER_INVITATION_EXPIRY_SECONDS,
    tokenLength: TOKEN_LENGTH
  }
}

export const getDefaultOptions = (type: TokenType): Required<Options> =>
  defaultOptionsMap[type]
