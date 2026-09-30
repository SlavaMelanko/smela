import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  rbacRepo,
  teamRepo,
  TokenRecord,
  tokenRepo,
  UserRoleRecord,
  UserTeamInfo
} from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import env from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { TOKEN_LENGTH, TokenStatus, TokenType } from '@/security/token'
import { Role } from '@/types'
import { hour, nowPlus } from '@/utils/chrono'

import { checkInvite } from '../check-invite'

describe('Check Invite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTokenString: string
  let mockTokenRecord: TokenRecord
  let mockTokenRepo: any
  let mockTeamRepo: any
  let mockRbacRepo: any

  let mockTeam: UserTeamInfo
  let mockAdminRole: UserRoleRecord

  beforeEach(async () => {
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

    mockTeam = {
      id: testUuids.TEAM_1,
      name: 'Acme Corp',
      position: 'Team Member'
    }

    mockAdminRole = {
      userId: testUuids.ADMIN_1,
      role: Role.Admin,
      invitedBy: testUuids.OWNER_1,
      assignedAt: new Date()
    }

    mockTokenRepo = {
      findByToken: mock(async () => mockTokenRecord)
    } satisfies Partial<typeof tokenRepo>
    mockTeamRepo = {
      findUserTeam: mock(async () => mockTeam)
    } satisfies Partial<typeof teamRepo>
    mockRbacRepo = {
      findRole: mock(async () => mockAdminRole)
    } satisfies Partial<typeof rbacRepo>

    await moduleMocker.mock('@/data', () => ({
      tokenRepo: mockTokenRepo,
      teamRepo: mockTeamRepo,
      rbacRepo: mockRbacRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('when token is valid for member invite', () => {
    it('should return member type and team name for member invite token', async () => {
      const result = await checkInvite(mockTokenString)

      expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(mockTokenString)
      expect(mockTokenRepo.findByToken).toHaveBeenCalledTimes(1)

      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(
        mockTokenRecord.userId
      )
      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledTimes(1)

      expect(mockRbacRepo.findRole).not.toHaveBeenCalled()

      expect(result).toEqual({ type: 'member', teamName: 'Acme Corp' })
    })
  })

  describe('when token is valid for admin invite', () => {
    beforeEach(() => {
      mockTeamRepo.findUserTeam.mockResolvedValue(undefined)
    })

    it('should return admin type and company name for admin invite token', async () => {
      const result = await checkInvite(mockTokenString)

      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(
        mockTokenRecord.userId
      )
      expect(mockRbacRepo.findRole).toHaveBeenCalledWith(mockTokenRecord.userId)
      expect(mockRbacRepo.findRole).toHaveBeenCalledTimes(1)

      expect(result).toEqual({ type: 'admin', teamName: env.COMPANY_NAME })
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
        name: 'cancelled',
        tokenRecord: () => ({
          ...mockTokenRecord,
          status: TokenStatus.Cancelled
        }),
        code: ErrorCode.TokenCancelled
      },
      {
        name: 'of a different type',
        tokenRecord: () => ({
          ...mockTokenRecord,
          type: TokenType.PasswordReset
        }),
        code: ErrorCode.TokenTypeMismatch
      }
    ]

    invalidTokenCases.forEach(({ name, tokenRecord, code }) => {
      it(`should throw ${code} when token is ${name}`, async () => {
        const record = tokenRecord()
        mockTokenRepo.findByToken.mockImplementation(async () => record)

        try {
          await checkInvite(mockTokenString)
          expect(true).toBe(false)
        } catch (error) {
          expect(error).toBeInstanceOf(AppError)
          expect((error as AppError).code).toBe(code)
        }

        expect(mockTeamRepo.findUserTeam).not.toHaveBeenCalled()
      })
    })
  })

  describe('when user has no team membership and no admin role', () => {
    it('should throw TokenDeprecated', async () => {
      mockTeamRepo.findUserTeam.mockResolvedValue(undefined)
      mockRbacRepo.findRole.mockResolvedValue(undefined)

      try {
        await checkInvite(mockTokenString)
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).code).toBe(ErrorCode.TokenDeprecated)
        expect((error as AppError).message).toBe('Invalid invite')
      }

      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(
        mockTokenRecord.userId
      )
      expect(mockRbacRepo.findRole).toHaveBeenCalledWith(mockTokenRecord.userId)
    })
  })

  describe('when user has non-admin role', () => {
    it('should throw TokenDeprecated', async () => {
      mockTeamRepo.findUserTeam.mockResolvedValue(undefined)
      mockRbacRepo.findRole.mockResolvedValue({
        ...mockAdminRole,
        role: Role.User
      })

      try {
        await checkInvite(mockTokenString)
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(AppError)
        expect((error as AppError).code).toBe(ErrorCode.TokenDeprecated)
        expect((error as AppError).message).toBe('Invalid invite')
      }
    })
  })

  describe('when database query fails', () => {
    it('should propagate the error', async () => {
      mockTeamRepo.findUserTeam.mockRejectedValue(
        new Error('Database connection failed')
      )

      try {
        await checkInvite(mockTokenString)
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Database connection failed')
      }
    })
  })
})
