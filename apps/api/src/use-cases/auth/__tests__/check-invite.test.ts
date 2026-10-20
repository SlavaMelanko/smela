import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team, teamRepo, TokenRecord, tokenRepo } from '@/data'

import {
  buildInvalidTokenCases,
  buildTokenRecord,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { env } from '@/env'
import { ErrorCode } from '@/errors'
import {
  hashToken,
  InviteKind,
  TOKEN_LENGTH,
  TokenType
} from '@/security/token'

import { checkInvite } from '../check-invite'

describe('checkInvite', () => {
  const RAW_TOKEN = 'a'.repeat(TOKEN_LENGTH)
  const moduleMocker = new ModuleMocker(import.meta.url)

  const INVITE_TOKEN = {
    userId: testUuids.USER_1,
    type: TokenType.UserInvite,
    metadata: { kind: InviteKind.Member, teamId: testUuids.TEAM_1 }
  }

  let mockTokenRecord: TokenRecord
  let mockTokenRepo: any
  let mockTeamRepo: any

  let mockTeam: Team

  beforeEach(async () => {
    mockTokenRecord = buildTokenRecord(INVITE_TOKEN)

    mockTeam = {
      id: testUuids.TEAM_1,
      name: 'Acme Corp',
      website: 'https://acme.com',
      description: null,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockTokenRepo = {
      findByHash: mock(async () => mockTokenRecord)
    } satisfies Partial<typeof tokenRepo>
    mockTeamRepo = {
      findById: mock(async (): Promise<Team | undefined> => mockTeam)
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      tokenRepo: mockTokenRepo,
      teamRepo: mockTeamRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('returns member type and team name for member invite token', async () => {
    const result = await checkInvite(RAW_TOKEN)

    expect(mockTokenRepo.findByHash).toHaveBeenCalledWith(
      await hashToken(RAW_TOKEN)
    )
    expect(mockTeamRepo.findById).toHaveBeenCalledWith(testUuids.TEAM_1)
    expect(result).toEqual({ kind: InviteKind.Member, teamName: 'Acme Corp' })
  })

  it('returns admin type and company name without a team lookup', async () => {
    mockTokenRepo.findByHash.mockImplementation(async () =>
      buildTokenRecord({
        ...INVITE_TOKEN,
        metadata: { kind: InviteKind.Admin }
      })
    )

    const result = await checkInvite(RAW_TOKEN)

    expect(mockTeamRepo.findById).not.toHaveBeenCalled()
    expect(result).toEqual({
      kind: InviteKind.Admin,
      teamName: env.COMPANY_NAME
    })
  })

  it('throws TokenDeprecated when token has no kind', async () => {
    mockTokenRepo.findByHash.mockImplementation(async () =>
      buildTokenRecord({ ...INVITE_TOKEN, metadata: null })
    )

    const error = await checkInvite(RAW_TOKEN).catch((error: unknown) => error)

    expect(error).toMatchObject({
      name: 'AppError',
      code: ErrorCode.TokenDeprecated
    })
    expect(mockTeamRepo.findById).not.toHaveBeenCalled()
  })

  buildInvalidTokenCases(
    buildTokenRecord(INVITE_TOKEN),
    TokenType.PasswordReset
  ).forEach(({ name, record, code }) => {
    it(`throws ${code} when token is ${name}`, async () => {
      mockTokenRepo.findByHash.mockImplementation(async () => record)

      const error = await checkInvite(RAW_TOKEN).catch(
        (error: unknown) => error
      )

      expect(error).toMatchObject({ name: 'AppError', code })

      expect(mockTeamRepo.findById).not.toHaveBeenCalled()
    })
  })

  it('throws TokenDeprecated when the invited team no longer exists', async () => {
    mockTeamRepo.findById.mockResolvedValue(undefined)

    const error = await checkInvite(RAW_TOKEN).catch((error: unknown) => error)

    expect(error).toMatchObject({
      name: 'AppError',
      code: ErrorCode.TokenDeprecated,
      message: 'Invalid invite'
    })
  })

  it('propagates database query errors', async () => {
    mockTeamRepo.findById.mockRejectedValue(
      new Error('Database connection failed')
    )

    const error = await checkInvite(RAW_TOKEN).catch((error: unknown) => error)

    expect(error).toMatchObject({ message: 'Database connection failed' })
  })
})
