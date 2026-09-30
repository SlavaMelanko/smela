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

import { ModuleMocker, testUuids } from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'
import { verifyJwt } from '@/security/jwt'
import { comparePasswordHashes } from '@/security/password'
import {
  hashToken,
  TOKEN_LENGTH,
  TokenStatus,
  TokenType
} from '@/security/token'
import { Role, UserStatus } from '@/types'
import { hour, nowPlus } from '@/utils/chrono'

import { acceptInvite } from '../accept-invite'

describe('Accept Invite', () => {
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
  let mockTransaction: any

  let mockUser: User
  let mockActivatedUser: User
  let mockResolvePermissions: any

  beforeEach(async () => {
    mockPassword = 'NewSecure@123'
    mockDeviceInfo = { ipAddress: '127.0.0.1', userAgent: 'test-agent' }

    mockTokenString = `mock-invite-token-${'1'.repeat(TOKEN_LENGTH - 18)}`
    mockTokenRecord = {
      id: 1,
      userId: testUuids.ADMIN_1,
      type: TokenType.UserInvite,
      token: mockTokenString,
      status: TokenStatus.Pending,
      expiresAt: nowPlus(hour()),
      createdAt: new Date(),
      usedAt: null,
      metadata: null
    }

    mockUser = {
      id: testUuids.ADMIN_1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.Admin,
      status: UserStatus.Pending,
      createdAt: new Date(),
      updatedAt: new Date()
    }

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
    mockTransaction = {
      transaction: mock(async (callback: any) => callback({}) as Promise<void>)
    }

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

  describe('when token is valid and active', () => {
    it('should mark token as used, update password, activate user, and return user with tokens', async () => {
      const result = await acceptInvite(
        { token: mockTokenString, password: mockPassword },
        mockDeviceInfo
      )

      expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
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

    it('should store a hash that matches the new password', async () => {
      await acceptInvite(
        { token: mockTokenString, password: mockPassword },
        mockDeviceInfo
      )

      const [, { passwordHash }] = mockAuthRepo.update.mock.calls[0]

      expect(passwordHash).not.toBe(mockPassword)
      expect(comparePasswordHashes(mockPassword, passwordHash)).resolves.toBe(
        true
      )
    })

    it('should sign an access token with activated user claims', async () => {
      const result = await acceptInvite(
        { token: mockTokenString, password: mockPassword },
        mockDeviceInfo
      )

      expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
        id: mockActivatedUser.id,
        email: mockActivatedUser.email,
        role: mockActivatedUser.role,
        status: UserStatus.Active
      })
    })

    it('should store only the hash of the returned refresh token', async () => {
      const result = await acceptInvite(
        { token: mockTokenString, password: mockPassword },
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
  })

  describe('when token validation fails', () => {
    const invalidTokenCases: {
      name: string
      tokenRecord: () => TokenRecord | undefined
      code: ErrorCode
    }[] = [
      {
        name: 'not found',
        tokenRecord: () => undefined,
        code: ErrorCode.TokenNotFound
      },
      {
        name: 'expired',
        tokenRecord: () => ({
          ...mockTokenRecord,
          expiresAt: new Date(Date.now() - 1000)
        }),
        code: ErrorCode.TokenExpired
      },
      {
        name: 'already used',
        tokenRecord: () => ({ ...mockTokenRecord, status: TokenStatus.Used }),
        code: ErrorCode.TokenAlreadyUsed
      },
      {
        name: 'a password reset token',
        tokenRecord: () => ({
          ...mockTokenRecord,
          type: TokenType.PasswordReset
        }),
        code: ErrorCode.TokenTypeMismatch
      }
    ]

    invalidTokenCases.forEach(({ name, tokenRecord, code }) => {
      it(`should throw ${code} without updating anything when token is ${name}`, async () => {
        const record = tokenRecord()
        mockTokenRepo.findByToken.mockImplementation(async () => record)

        try {
          await acceptInvite(
            { token: mockTokenString, password: mockPassword },
            mockDeviceInfo
          )
          expect(true).toBe(false)
        } catch (error) {
          expect(error).toBeInstanceOf(AppError)
          expect((error as AppError).code).toBe(code)
        }

        expect(mockTransaction.transaction).not.toHaveBeenCalled()
        expect(mockTokenRepo.update).not.toHaveBeenCalled()
        expect(mockAuthRepo.update).not.toHaveBeenCalled()
        expect(mockUserRepo.update).not.toHaveBeenCalled()
      })
    })
  })

  describe('when token marking as used fails', () => {
    it('should throw the error and not update password or user status', async () => {
      mockTokenRepo.update.mockImplementation(async () => {
        throw new Error('Database connection failed')
      })

      try {
        await acceptInvite(
          { token: mockTokenString, password: mockPassword },
          mockDeviceInfo
        )
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Database connection failed')
      }

      expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
      expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
      expect(mockAuthRepo.update).not.toHaveBeenCalled()
      expect(mockUserRepo.update).not.toHaveBeenCalled()
    })
  })

  describe('when password update fails', () => {
    it('should throw the error within transaction', async () => {
      mockAuthRepo.update.mockImplementation(async () => {
        throw new Error('Password update failed')
      })

      try {
        await acceptInvite(
          { token: mockTokenString, password: mockPassword },
          mockDeviceInfo
        )
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Password update failed')
      }

      expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
      expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
      expect(mockAuthRepo.update).toHaveBeenCalledTimes(1)
      expect(mockUserRepo.update).not.toHaveBeenCalled()
    })
  })

  describe('when user status update fails', () => {
    it('should throw the error within transaction', async () => {
      mockUserRepo.update.mockImplementation(async () => {
        throw new Error('User status update failed')
      })

      try {
        await acceptInvite(
          { token: mockTokenString, password: mockPassword },
          mockDeviceInfo
        )
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('User status update failed')
      }

      expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
      expect(mockTokenRepo.update).toHaveBeenCalledTimes(1)
      expect(mockAuthRepo.update).toHaveBeenCalledTimes(1)
      expect(mockUserRepo.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should reject empty password', async () => {
      expect(
        acceptInvite({ token: mockTokenString, password: '' }, mockDeviceInfo)
      ).rejects.toThrow('password must not be empty')
    })

    it('should handle very long passwords', async () => {
      const longPassword = `A1@${'a'.repeat(1000)}`

      const result = await acceptInvite(
        { token: mockTokenString, password: longPassword },
        mockDeviceInfo
      )

      expect(result.data.user).toEqual(mockActivatedUser)

      const [, { passwordHash }] = mockAuthRepo.update.mock.calls[0]
      expect(comparePasswordHashes(longPassword, passwordHash)).resolves.toBe(
        true
      )
    })
  })
})
