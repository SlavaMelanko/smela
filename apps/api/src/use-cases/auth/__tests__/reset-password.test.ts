import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  authRepo,
  refreshTokenRepo,
  teamRepo,
  TokenRecord,
  tokenRepo,
  User,
  userRepo,
  UserTeamInfo
} from '@/data'
import type { DeviceInfo } from '@/net/http/device'

import {
  buildUser,
  createTransactionMock,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { ErrorCode } from '@/errors'
import { verifyJwt } from '@/security/jwt'
import { comparePasswordHashes } from '@/security/password'
import {
  hashToken,
  TOKEN_LENGTH,
  TokenStatus,
  TokenType
} from '@/security/token'
import { UserStatus } from '@/types'
import { hour, nowMinus, nowPlus } from '@/utils/chrono'

import { resetPassword } from '../reset-password'

describe('resetPassword', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockPassword: string
  let mockDeviceInfo: DeviceInfo

  let mockTokenString: string
  let mockTokenRecord: TokenRecord
  let mockTokenRepo: any
  let mockAuthRepo: any
  let mockUserRepo: any
  let mockRefreshTokenRepo: any
  let mockTeamRepo: any
  let mockTeam: UserTeamInfo | undefined
  let mockTransaction: ReturnType<typeof createTransactionMock>

  let mockUser: User
  let mockResolvePermissions: any

  beforeEach(async () => {
    mockPassword = 'NewSecure@123'
    mockDeviceInfo = { ipAddress: '127.0.0.1', userAgent: 'test-agent' }

    mockTokenString = `mock-reset-token-${'1'.repeat(TOKEN_LENGTH - 18)}`
    mockTokenRecord = {
      id: 1,
      userId: testUuids.USER_1,
      type: TokenType.PasswordReset,
      token: mockTokenString,
      status: TokenStatus.Pending,
      expiresAt: nowPlus(hour()),
      createdAt: new Date(),
      usedAt: null,
      metadata: null
    }

    mockUser = buildUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      status: UserStatus.Active
    })

    mockTokenRepo = {
      findByToken: mock(async () => mockTokenRecord),
      update: mock(async () => {})
    } satisfies Partial<typeof tokenRepo>
    mockAuthRepo = {
      update: mock(async () => {})
    } satisfies Partial<typeof authRepo>
    mockUserRepo = {
      findById: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>
    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    } satisfies Partial<typeof refreshTokenRepo>
    mockTeam = undefined
    mockTeamRepo = {
      findUserTeam: mock(async () => mockTeam)
    } satisfies Partial<typeof teamRepo>
    mockTransaction = createTransactionMock()

    await moduleMocker.mock('@/data', () => ({
      tokenRepo: mockTokenRepo,
      authRepo: mockAuthRepo,
      userRepo: mockUserRepo,
      refreshTokenRepo: mockRefreshTokenRepo,
      teamRepo: mockTeamRepo,
      db: mockTransaction
    }))

    mockResolvePermissions = mock(async () => undefined)

    await moduleMocker.mock('../../resolve-permissions', () => ({
      resolvePermissionList: mockResolvePermissions
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  const getStoredPasswordHash = () =>
    mockAuthRepo.update.mock.calls[0][1].passwordHash as string

  const expectRejectsWithoutUpdates = async (code: ErrorCode) => {
    const error = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    ).catch((error: unknown) => error)

    expect(error).toMatchObject({ name: 'AppError', code })

    expect(mockTransaction.transaction).not.toHaveBeenCalled()
    expect(mockTokenRepo.update).not.toHaveBeenCalled()
    expect(mockAuthRepo.update).not.toHaveBeenCalled()
  }

  it('validates token, marks it as used, updates password, and returns user with tokens', async () => {
    const result = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    )

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

    expect(mockAuthRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.userId,
      {
        passwordHash: expect.any(String)
      },
      {}
    )
    expect(mockAuthRepo.update).toHaveBeenCalledTimes(1)

    expect(mockUserRepo.findById).toHaveBeenCalledWith(mockTokenRecord.userId)
    expect(mockRefreshTokenRepo.create).toHaveBeenCalledTimes(1)

    expect(result).toEqual({
      data: {
        user: mockUser,
        team: undefined,
        permissions: undefined,
        accessToken: expect.any(String)
      },
      refreshToken: expect.any(String)
    })
  })

  it('stores a hash of the new password', async () => {
    await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    )

    const passwordHash = getStoredPasswordHash()
    expect(passwordHash).not.toBe(mockPassword)
    expect(comparePasswordHashes(mockPassword, passwordHash)).resolves.toBe(
      true
    )
  })

  it('signs an access token with user claims', async () => {
    const result = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    )

    expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      status: mockUser.status
    })
  })

  it('stores only the hash of the returned refresh token', async () => {
    const result = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    )

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

  it('includes team info when user belongs to a team', async () => {
    mockTeam = {
      id: 'team-456',
      name: 'Tech Inc',
      position: 'Developer'
    }
    mockTeamRepo.findUserTeam.mockImplementation(async () => mockTeam)

    const result = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    )

    expect(result.data.team).toEqual(mockTeam)
    expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(mockUser.id)
  })

  it('throws TokenNotFound without updating anything when token does not exist', async () => {
    mockTokenRepo.findByToken.mockImplementation(async () => undefined)

    await expectRejectsWithoutUpdates(ErrorCode.TokenNotFound)
  })

  it('throws TokenExpired when token is expired', async () => {
    mockTokenRecord.expiresAt = nowMinus(hour())

    await expectRejectsWithoutUpdates(ErrorCode.TokenExpired)
  })

  it('throws TokenAlreadyUsed when token is already used', async () => {
    mockTokenRecord.status = TokenStatus.Used
    mockTokenRecord.usedAt = nowMinus(hour())

    await expectRejectsWithoutUpdates(ErrorCode.TokenAlreadyUsed)
  })

  it('throws TokenTypeMismatch when token type is wrong', async () => {
    mockTokenRecord.type = TokenType.EmailVerification

    await expectRejectsWithoutUpdates(ErrorCode.TokenTypeMismatch)
  })

  it('throws without updating password when marking token as used fails', async () => {
    mockTokenRepo.update.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    const error = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    ).catch((error: unknown) => error)

    expect(error).toMatchObject({ message: 'Database connection failed' })

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
    expect(mockAuthRepo.update).not.toHaveBeenCalled()
  })

  it('throws within transaction when password update fails', async () => {
    mockAuthRepo.update.mockImplementation(async () => {
      throw new Error('Password update failed')
    })

    const error = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    ).catch((error: unknown) => error)

    expect(error).toMatchObject({ message: 'Password update failed' })

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
    expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
    expect(mockAuthRepo.update).toHaveBeenCalledTimes(1)
  })

  it('accepts very long passwords', async () => {
    const longPassword = `A1@${'a'.repeat(1000)}`

    const result = await resetPassword(
      { token: mockTokenString, password: longPassword },
      mockDeviceInfo
    )

    expect(result.data.user).toEqual(mockUser)
    expect(
      comparePasswordHashes(longPassword, getStoredPasswordHash())
    ).resolves.toBe(true)
  })

  it('omits permissions from data when user has no permissions', async () => {
    const result = await resetPassword(
      { token: mockTokenString, password: mockPassword },
      mockDeviceInfo
    )

    expect(result.data.permissions).toBeUndefined()
  })
})
