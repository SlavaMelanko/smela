import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  rbacRepo,
  refreshTokenRepo,
  TokenRecord,
  tokenRepo,
  User,
  userRepo
} from '@/data'
import type { DeviceInfo } from '@/net/http/device'

import {
  buildUser,
  createTransactionMock,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'
import { verifyJwt } from '@/security/jwt'
import {
  hashToken,
  TOKEN_LENGTH,
  TokenStatus,
  TokenType
} from '@/security/token'
import { Action, Permission, Resource, UserStatus } from '@/types'
import { hour, hours, nowMinus, nowPlus } from '@/utils/chrono'

import { verifyEmail } from '../verify-email'

describe('verifyEmail', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockDeviceInfo: DeviceInfo
  let mockTokenString: string
  let mockTokenRecord: TokenRecord
  let mockTokenRepo: any
  let mockUser: User
  let mockUserRepo: any
  let mockRefreshTokenRepo: any
  let mockRbacRepo: any
  let mockTransaction: ReturnType<typeof createTransactionMock>

  beforeEach(async () => {
    mockDeviceInfo = {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Test)'
    }
    mockTokenString = 'a'.repeat(TOKEN_LENGTH)
    mockTokenRecord = {
      id: 1,
      userId: testUuids.USER_1,
      type: TokenType.EmailVerification,
      token: mockTokenString,
      status: TokenStatus.Pending,
      expiresAt: nowPlus(hours(48)),
      usedAt: null,
      metadata: null,
      createdAt: new Date()
    }
    mockTokenRepo = {
      findByToken: mock(async () => mockTokenRecord),
      update: mock(async () => {})
    } satisfies Partial<typeof tokenRepo>
    mockUser = buildUser()
    mockUserRepo = {
      update: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>
    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    } satisfies Partial<typeof refreshTokenRepo>
    mockRbacRepo = {
      findUserPermissions: mock(async () => [
        { action: Action.View, resource: Resource.Dashboard },
        { action: Action.Manage, resource: Resource.Dashboard }
      ])
    } satisfies Partial<typeof rbacRepo>
    mockTransaction = createTransactionMock()

    await moduleMocker.mock('@/data', () => ({
      tokenRepo: mockTokenRepo,
      userRepo: mockUserRepo,
      refreshTokenRepo: mockRefreshTokenRepo,
      rbacRepo: mockRbacRepo,
      db: mockTransaction
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('marks token as used, updates user status, and returns user with JWT token', async () => {
    const result = await verifyEmail({ token: mockTokenString }, mockDeviceInfo)

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.findByToken).toHaveBeenCalledTimes(1)

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)

    expect(mockTokenRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.id,
      {
        status: TokenStatus.Used,
        usedAt: expect.any(Date)
      },
      {}
    )
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.userId,
      {
        status: UserStatus.Verified
      },
      {}
    )
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('refreshToken')
    expect(result.data).toHaveProperty('user')
    expect(result.data).toHaveProperty('accessToken')
    expect(result.data.user).not.toHaveProperty('tokenVersion')
    expect(result.data.user.email).toBe(mockUser.email)
  })

  it('signs an access token with user claims and permissions', async () => {
    const result = await verifyEmail({ token: mockTokenString }, mockDeviceInfo)

    expect(result.data.permissions).toEqual([
      Permission.ViewDashboard,
      Permission.ManageDashboard
    ])
    expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      status: mockUser.status,
      permissions: result.data.permissions
    })
  })

  it('stores only the hash of the returned refresh token', async () => {
    const result = await verifyEmail({ token: mockTokenString }, mockDeviceInfo)

    expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
      {
        userId: mockUser.id,
        tokenHash: await hashToken(result.refreshToken),
        ipAddress: mockDeviceInfo.ipAddress,
        userAgent: mockDeviceInfo.userAgent,
        expiresAt: expect.any(Date)
      },
      undefined
    )
  })

  it('sets current timestamp when marking token as used', async () => {
    const beforeCall = Date.now()
    await verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    const afterCall = Date.now()

    const updateCall = mockTokenRepo.update.mock.calls[0]
    const usedAt = updateCall[1].usedAt as Date

    expect(usedAt.getTime()).toBeGreaterThanOrEqual(beforeCall)
    expect(usedAt.getTime()).toBeLessThanOrEqual(afterCall)
  })

  it('throws TokenNotFound when token does not exist', async () => {
    mockTokenRepo.findByToken.mockImplementation(async () => null)

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.TokenNotFound
      })
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('throws TokenAlreadyUsed when token is already used', async () => {
    const usedTokenRecord = {
      ...mockTokenRecord,
      status: TokenStatus.Used,
      usedAt: nowMinus(hour())
    }

    mockTokenRepo.findByToken.mockImplementation(async () => usedTokenRecord)

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.TokenAlreadyUsed
      })
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('throws TokenDeprecated when token is deprecated', async () => {
    const deprecatedTokenRecord = {
      ...mockTokenRecord,
      status: TokenStatus.Deprecated
    }

    mockTokenRepo.findByToken.mockImplementation(
      async () => deprecatedTokenRecord
    )

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.TokenDeprecated
      })
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('throws TokenExpired when token is expired', async () => {
    const expiredTokenRecord = {
      ...mockTokenRecord,
      expiresAt: nowMinus(hour())
    }

    mockTokenRepo.findByToken.mockImplementation(async () => expiredTokenRecord)

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.TokenExpired
      })
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('throws TokenTypeMismatch when token type is incorrect', async () => {
    const wrongTypeTokenRecord = {
      ...mockTokenRecord,
      type: TokenType.PasswordReset
    }

    mockTokenRepo.findByToken.mockImplementation(
      async () => wrongTypeTokenRecord
    )

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.TokenTypeMismatch,
        message: expect.stringMatching(
          new RegExp(
            `expected ${TokenType.EmailVerification}.*got ${TokenType.PasswordReset}`
          )
        )
      })
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('propagates findByToken errors', async () => {
    mockTokenRepo.findByToken.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow('Database connection failed')

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('propagates token update errors', async () => {
    mockTokenRepo.update.mockImplementation(async () => {
      throw new Error('Token update failed')
    })

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow('Token update failed')

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.update).not.toHaveBeenCalled()
  })

  it('propagates user update errors', async () => {
    mockUserRepo.update.mockImplementation(async () => {
      throw new Error('User update failed')
    })

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow('User update failed')

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1)
  })

  it('throws InternalError when user update fails', async () => {
    mockUserRepo.update.mockImplementation(async () => {
      throw new AppError(ErrorCode.InternalError, 'Failed to update user')
    })

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.InternalError
      })
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1)
  })

  it('verifies token just before expiry', async () => {
    const boundaryTokenRecord = {
      ...mockTokenRecord,
      expiresAt: new Date(Date.now() + 1000)
    }

    mockTokenRepo.findByToken.mockImplementation(
      async () => boundaryTokenRecord
    )

    const result = await verifyEmail({ token: mockTokenString }, mockDeviceInfo)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('refreshToken')
    expect(result.data).toHaveProperty('user')
    expect(result.data).toHaveProperty('accessToken')
    expect(result.data.user.email).toBe(mockUser.email)
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.update).toHaveBeenCalledTimes(1)
  })

  it('updates the user referenced by the token', async () => {
    const differentUserTokenRecord = {
      ...mockTokenRecord,
      userId: testUuids.NON_EXISTENT
    }

    mockTokenRepo.findByToken.mockImplementation(
      async () => differentUserTokenRecord
    )

    const result = await verifyEmail({ token: mockTokenString }, mockDeviceInfo)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('refreshToken')
    expect(result.data).toHaveProperty('user')
    expect(result.data).toHaveProperty('accessToken')
    expect(result.data.user.email).toBe(mockUser.email)
    expect(mockUserRepo.update).toHaveBeenCalledWith(
      testUuids.NON_EXISTENT,
      {
        status: UserStatus.Verified
      },
      {}
    )
  })

  it('verifies various token string formats', async () => {
    const testTokens = [
      'a'.repeat(TOKEN_LENGTH), // all same character
      '1'.repeat(TOKEN_LENGTH), // all numbers
      'abcdef1234567890'.repeat(TOKEN_LENGTH / 16), // mixed hex
      'A'.repeat(TOKEN_LENGTH / 2) + 'a'.repeat(TOKEN_LENGTH / 2) // mixed case
    ]

    for (const testToken of testTokens) {
      const testTokenRecord = { ...mockTokenRecord, token: testToken }

      mockTokenRepo.findByToken.mockImplementation(async () => testTokenRecord)

      const result = await verifyEmail({ token: testToken }, mockDeviceInfo)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('refreshToken')
      expect(result.data).toHaveProperty('user')
      expect(result.data).toHaveProperty('accessToken')
      expect(result.data.user.email).toBe(mockUser.email)
      expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(testToken)
    }
  })

  it('marks token with null usedAt as used', async () => {
    const tokenWithNullUsedAt = {
      ...mockTokenRecord,
      usedAt: null
    }

    mockTokenRepo.findByToken.mockImplementation(
      async () => tokenWithNullUsedAt
    )

    const result = await verifyEmail({ token: mockTokenString }, mockDeviceInfo)

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('refreshToken')
    expect(result.data).toHaveProperty('user')
    expect(result.data).toHaveProperty('accessToken')
    expect(result.data.user.email).toBe(mockUser.email)
    expect(mockTokenRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.id,
      {
        status: TokenStatus.Used,
        usedAt: expect.any(Date)
      },
      {}
    )
  })

  it('throws TokenAlreadyUsed when pending token has usedAt', async () => {
    const inconsistentTokenRecord = {
      ...mockTokenRecord,
      status: TokenStatus.Pending,
      usedAt: nowMinus(hour())
    }

    mockTokenRepo.findByToken.mockImplementation(
      async () => inconsistentTokenRecord
    )

    expect(
      verifyEmail({ token: mockTokenString }, mockDeviceInfo)
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.TokenAlreadyUsed
      })
    )
  })
})
