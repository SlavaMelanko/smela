import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  rbacRepo,
  teamRepo,
  TokenRecord,
  tokenRepo,
  UserRoleRecord,
  UserTeamInfo
} from '@/data'

import {
  buildInvalidTokenCases,
  buildTokenRecord,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import env from '@/env'
import { ErrorCode } from '@/errors'
import { TokenType } from '@/security/token'
import { Role } from '@/types'

import { checkInvite } from '../check-invite'

describe('checkInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const INVITE_TOKEN = {
    userId: testUuids.ADMIN_1,
    type: TokenType.UserInvite
  }

  let mockTokenRecord: TokenRecord
  let mockTokenRepo: any
  let mockTeamRepo: any
  let mockRbacRepo: any

  let mockTeam: UserTeamInfo
  let mockAdminRole: UserRoleRecord

  beforeEach(async () => {
    mockTokenRecord = buildTokenRecord(INVITE_TOKEN)

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

  it('returns member type and team name for member invite token', async () => {
    const result = await checkInvite(mockTokenRecord.token)

    expect(mockTokenRepo.findByToken).toHaveBeenCalledWith(
      mockTokenRecord.token
    )
    expect(mockTokenRepo.findByToken).toHaveBeenCalledTimes(1)

    expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(
      mockTokenRecord.userId
    )
    expect(mockTeamRepo.findUserTeam).toHaveBeenCalledTimes(1)

    expect(mockRbacRepo.findRole).not.toHaveBeenCalled()

    expect(result).toEqual({ type: 'member', teamName: 'Acme Corp' })
  })

  describe('when token is valid for admin invite', () => {
    beforeEach(() => {
      mockTeamRepo.findUserTeam.mockResolvedValue(undefined)
    })

    it('returns admin type and company name', async () => {
      const result = await checkInvite(mockTokenRecord.token)

      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(
        mockTokenRecord.userId
      )
      expect(mockRbacRepo.findRole).toHaveBeenCalledWith(mockTokenRecord.userId)
      expect(mockRbacRepo.findRole).toHaveBeenCalledTimes(1)

      expect(result).toEqual({ type: 'admin', teamName: env.COMPANY_NAME })
    })
  })

  buildInvalidTokenCases(
    buildTokenRecord(INVITE_TOKEN),
    TokenType.PasswordReset
  ).forEach(({ name, record, code }) => {
    it(`throws ${code} when token is ${name}`, async () => {
      mockTokenRepo.findByToken.mockImplementation(async () => record)

      const error = await checkInvite(mockTokenRecord.token).catch(
        (error: unknown) => error
      )

      expect(error).toMatchObject({ name: 'AppError', code })

      expect(mockTeamRepo.findUserTeam).not.toHaveBeenCalled()
    })
  })

  it('throws TokenDeprecated when user has no team membership and no admin role', async () => {
    mockTeamRepo.findUserTeam.mockResolvedValue(undefined)
    mockRbacRepo.findRole.mockResolvedValue(undefined)

    const error = await checkInvite(mockTokenRecord.token).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({
      name: 'AppError',
      code: ErrorCode.TokenDeprecated,
      message: 'Invalid invite'
    })

    expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(
      mockTokenRecord.userId
    )
    expect(mockRbacRepo.findRole).toHaveBeenCalledWith(mockTokenRecord.userId)
  })

  it('throws TokenDeprecated when user has non-admin role', async () => {
    mockTeamRepo.findUserTeam.mockResolvedValue(undefined)
    mockRbacRepo.findRole.mockResolvedValue({
      ...mockAdminRole,
      role: Role.User
    })

    const error = await checkInvite(mockTokenRecord.token).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({
      name: 'AppError',
      code: ErrorCode.TokenDeprecated,
      message: 'Invalid invite'
    })
  })

  it('propagates database query errors', async () => {
    mockTeamRepo.findUserTeam.mockRejectedValue(
      new Error('Database connection failed')
    )

    const error = await checkInvite(mockTokenRecord.token).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Database connection failed' })
  })
})
