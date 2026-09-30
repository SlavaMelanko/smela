import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  authRepo,
  refreshTokenRepo,
  teamRepo,
  TokenRecord,
  tokenRepo,
  User,
  userRepo
} from '@/data'
import type { DeviceInfo } from '@/net/http/device'

import {
  buildInvalidTokenCases,
  buildTokenRecord,
  buildUser,
  createTransactionMock,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { verifyJwt } from '@/security/jwt'
import { comparePasswordHashes } from '@/security/password'
import { hashToken, TokenStatus, TokenType } from '@/security/token'
import { Role, UserStatus } from '@/types'

import { acceptInvite } from '../accept-invite'

describe('acceptInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const INVITE_TOKEN = {
    userId: testUuids.ADMIN_1,
    type: TokenType.UserInvite
  }

  let mockPassword: string
  let mockDeviceInfo: DeviceInfo

  let mockTokenRecord: TokenRecord
  let mockTokenRepo: any
  let mockAuthRepo: any
  let mockUserRepo: any
  let mockRefreshTokenRepo: any
  let mockTeamRepo: any
  let mockTransaction: ReturnType<typeof createTransactionMock>

  let mockUser: User
  let mockActivatedUser: User
  let mockResolvePermissions: any

  beforeEach(async () => {
    mockPassword = 'NewSecure@123'
    mockDeviceInfo = { ipAddress: '127.0.0.1', userAgent: 'test-agent' }

    mockTokenRecord = buildTokenRecord(INVITE_TOKEN)

    mockUser = buildUser({
      id: testUuids.ADMIN_1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.Admin,
      status: UserStatus.Pending
    })

    mockActivatedUser = {
      ...mockUser,
      status: UserStatus.Active
    }

    mockTokenRepo = {
      findByToken: mock(async () => mockTokenRecord),
      update: mock(async () => {})
    } satisfies Partial<typeof tokenRepo>
    mockAuthRepo = {
      update: mock(async () => {})
    } satisfies Partial<typeof authRepo>
    mockUserRepo = {
      update: mock(async () => mockActivatedUser)
    } satisfies Partial<typeof userRepo>
    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    } satisfies Partial<typeof refreshTokenRepo>
    mockTeamRepo = {
      findUserTeam: mock(async () => undefined)
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

  it('marks token as used, updates password, activates user, and returns user with tokens', async () => {
    const result = await acceptInvite(
      { token: mockTokenRecord.token, password: mockPassword },
      mockDeviceInfo
    )

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(
      mockTokenRecord.token
    )
    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)

    expect(mockTokenRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.id,
      {
        status: TokenStatus.Used,
        usedAt: expect.any(Date)
      },
      {}
    )
    expect(mockAuthRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.userId,
      { passwordHash: expect.any(String) },
      {}
    )
    expect(mockUserRepo.update).toHaveBeenCalledWith(
      mockTokenRecord.userId,
      { status: UserStatus.Active },
      {}
    )

    expect(result).toEqual({
      data: {
        user: mockActivatedUser,
        team: undefined,
        permissions: undefined,
        accessToken: expect.any(String)
      },
      refreshToken: expect.any(String)
    })
  })

  it('stores a hash that matches the new password', async () => {
    await acceptInvite(
      { token: mockTokenRecord.token, password: mockPassword },
      mockDeviceInfo
    )

    const [, { passwordHash }] = mockAuthRepo.update.mock.calls[0]

    expect(passwordHash).not.toBe(mockPassword)
    expect(comparePasswordHashes(mockPassword, passwordHash)).resolves.toBe(
      true
    )
  })

  it('signs an access token with activated user claims', async () => {
    const result = await acceptInvite(
      { token: mockTokenRecord.token, password: mockPassword },
      mockDeviceInfo
    )

    expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
      id: mockActivatedUser.id,
      email: mockActivatedUser.email,
      role: mockActivatedUser.role,
      status: UserStatus.Active
    })
  })

  it('stores only the hash of the returned refresh token', async () => {
    const result = await acceptInvite(
      { token: mockTokenRecord.token, password: mockPassword },
      mockDeviceInfo
    )

    expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockActivatedUser.id,
        tokenHash: await hashToken(result.refreshToken),
        expiresAt: expect.any(Date)
      }),
      undefined
    )
  })

  buildInvalidTokenCases(
    buildTokenRecord(INVITE_TOKEN),
    TokenType.PasswordReset
  ).forEach(({ name, record, code }) => {
    it(`throws ${code} without updating anything when token is ${name}`, async () => {
      mockTokenRepo.findByToken.mockImplementation(async () => record)

      const error = await acceptInvite(
        { token: mockTokenRecord.token, password: mockPassword },
        mockDeviceInfo
      ).catch((error: unknown) => error)

      expect(error).toMatchObject({ name: 'AppError', code })

      expect(mockTransaction.transaction).not.toHaveBeenCalled()
      expect(mockTokenRepo.update).not.toHaveBeenCalled()
      expect(mockAuthRepo.update).not.toHaveBeenCalled()
      expect(mockUserRepo.update).not.toHaveBeenCalled()
    })
  })

  describe('when a transaction write fails', () => {
    const writes = [
      'token marking as used',
      'password update',
      'user status update'
    ]

    writes.forEach((name, failedIndex) => {
      it(`throws and skips later writes when ${name} fails`, async () => {
        // Same order as writes
        const writeMocks = [
          mockTokenRepo.update,
          mockAuthRepo.update,
          mockUserRepo.update
        ]
        writeMocks[failedIndex].mockImplementation(async () => {
          throw new Error(`${name} failed`)
        })

        const error = await acceptInvite(
          { token: mockTokenRecord.token, password: mockPassword },
          mockDeviceInfo
        ).catch((error: unknown) => error)

        expect(error).toMatchObject({ message: `${name} failed` })
        expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
        writeMocks.forEach((writeMock, index) => {
          expect(writeMock).toHaveBeenCalledTimes(index <= failedIndex ? 1 : 0)
        })
      })
    })
  })

  it('rejects empty password', async () => {
    expect(
      acceptInvite(
        { token: mockTokenRecord.token, password: '' },
        mockDeviceInfo
      )
    ).rejects.toThrow('password must not be empty')
  })

  it('accepts very long passwords', async () => {
    const longPassword = `A1@${'a'.repeat(1000)}`

    const result = await acceptInvite(
      { token: mockTokenRecord.token, password: longPassword },
      mockDeviceInfo
    )

    expect(result.data.user).toEqual(mockActivatedUser)

    const [, { passwordHash }] = mockAuthRepo.update.mock.calls[0]
    expect(comparePasswordHashes(longPassword, passwordHash)).resolves.toBe(
      true
    )
  })
})
