import type { TokenRecord } from '@/data'

import { ErrorCode } from '@/errors'
import { TOKEN_LENGTH, TokenStatus, TokenType } from '@/security/token'
import { hour, nowPlus } from '@/utils/chrono'

import { testUuids } from '../uuid'

export const buildTokenRecord = (
  overrides: Partial<TokenRecord> = {}
): TokenRecord => ({
  id: 1,
  userId: testUuids.USER_1,
  type: TokenType.EmailVerification,
  token: '1'.repeat(TOKEN_LENGTH),
  status: TokenStatus.Pending,
  expiresAt: nowPlus(hour()),
  createdAt: new Date(),
  usedAt: null,
  metadata: null,
  ...overrides
})

interface InvalidTokenCase {
  name: string
  record: TokenRecord | undefined
  code: ErrorCode
}

// Records the real TokenValidator rejects, derived from a valid record
export const buildInvalidTokenCases = (
  valid: TokenRecord,
  wrongType: TokenType
): InvalidTokenCase[] => [
  { name: 'not found', record: undefined, code: ErrorCode.TokenNotFound },
  {
    name: 'expired',
    record: { ...valid, expiresAt: new Date(Date.now() - 1000) },
    code: ErrorCode.TokenExpired
  },
  {
    name: 'already used',
    record: { ...valid, status: TokenStatus.Used },
    code: ErrorCode.TokenAlreadyUsed
  },
  {
    name: 'cancelled',
    record: { ...valid, status: TokenStatus.Cancelled },
    code: ErrorCode.TokenCancelled
  },
  {
    name: 'of a different type',
    record: { ...valid, type: wrongType },
    code: ErrorCode.TokenTypeMismatch
  }
]
