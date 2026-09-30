import { describe, expect, it } from 'bun:test'

import type { TokenRecord } from '@/data'

import { testUuids } from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'

import { TokenStatus, TokenType } from '../types'
import TokenValidator from '../validator'

describe('TokenValidator', () => {
  const createValidToken = (overrides?: Partial<TokenRecord>): TokenRecord => ({
    id: 1,
    userId: testUuids.USER_1,
    type: TokenType.EmailVerification,
    status: TokenStatus.Pending,
    token: 'valid-token-123',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    usedAt: null,
    metadata: null,
    createdAt: new Date(),
    ...overrides
  })

  it('passes a valid token', () => {
    const token = createValidToken()

    const result = TokenValidator.validate(token, TokenType.EmailVerification)

    expect(result).toBe(token)
  })

  it('throws TokenNotFound when the token is undefined', () => {
    expect(() => {
      TokenValidator.validate(undefined, TokenType.EmailVerification)
    }).toThrow(new AppError(ErrorCode.TokenNotFound))
  })

  it('throws TokenAlreadyUsed when the status is Used', () => {
    const token = createValidToken({ status: TokenStatus.Used })

    expect(() => {
      TokenValidator.validate(token, TokenType.EmailVerification)
    }).toThrow(new AppError(ErrorCode.TokenAlreadyUsed))
  })

  it('throws TokenAlreadyUsed when usedAt is set', () => {
    const token = createValidToken({ usedAt: new Date() })

    expect(() => {
      TokenValidator.validate(token, TokenType.EmailVerification)
    }).toThrow(new AppError(ErrorCode.TokenAlreadyUsed))
  })

  it('throws TokenDeprecated when the status is Deprecated', () => {
    const token = createValidToken({ status: TokenStatus.Deprecated })

    expect(() => {
      TokenValidator.validate(token, TokenType.EmailVerification)
    }).toThrow(new AppError(ErrorCode.TokenDeprecated))
  })

  it('throws TokenExpired when the token is expired', () => {
    const token = createValidToken({ expiresAt: new Date(Date.now() - 1000) })

    expect(() => {
      TokenValidator.validate(token, TokenType.EmailVerification)
    }).toThrow(new AppError(ErrorCode.TokenExpired))
  })

  it('throws TokenTypeMismatch when the type does not match', () => {
    const token = createValidToken({ type: TokenType.PasswordReset })

    expect(() => {
      TokenValidator.validate(token, TokenType.EmailVerification)
    }).toThrow(AppError)
  })
})
