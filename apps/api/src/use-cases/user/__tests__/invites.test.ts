import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  authRepo,
  db,
  rbacRepo,
  TeamMemberDetails,
  teamRepo,
  TeamWithMemberCount,
  tokenRepo,
  User,
  userRepo
} from '@/data'

import {
  buildTeamMember,
  buildUser,
  createTransactionMock,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { env } from '@/env'
import { ErrorCode } from '@/errors'
import { InviteKind, TokenType } from '@/security/token'
import {
  getUserDefaultPermissions,
  MembershipStatus,
  Role,
  UserStatus
} from '@/types'

import {
  cancelMemberInvite,
  inviteMember,
  resendMemberInvite
} from '../invites'

const { TEAM_1, USER_1, USER_2 } = testUuids

const buildTestTeam = (): TeamWithMemberCount => ({
  id: TEAM_1,
  name: 'Acme Corp',
  website: 'https://acme.com',
  description: 'A test team',
  createdBy: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  memberCount: 5
})

const buildInviter = () =>
  buildUser({
    id: USER_2,
    nickname: 'Admin',
    firstName: 'Admin',
    status: UserStatus.Active
  })

const buildPendingMember = (): TeamMemberDetails => ({
  ...buildTeamMember(USER_1),
  status: MembershipStatus.Pending
})

const INVITE_TOKEN_ISSUE = {
  userId: USER_1,
  type: TokenType.UserInvite,
  tokenHash: expect.any(String),
  expiresAt: expect.any(Date),
  metadata: { kind: InviteKind.Member, teamId: TEAM_1 }
}

const readSentEmail = (send: any): unknown => send.mock.calls[0][0].data

describe('inviteMember', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeam: TeamWithMemberCount
  let mockUserRepo: any
  let mockAuthRepoCreate: any
  let mockTeamRepo: any
  let mockTokenRepoIssue: any
  let mockRbacSet: any
  let mockEmailService: any

  const inviteParams = {
    email: 'john@example.com',
    position: 'Developer',
    permissions: { teams: { view: true, manage: true } }
  }

  beforeEach(async () => {
    mockTeam = buildTestTeam()

    mockUserRepo = {
      findByEmail: mock(async (): Promise<User | undefined> => undefined),
      findById: mock(async (): Promise<User | undefined> => buildInviter()),
      create: mock(async () =>
        buildUser({ id: USER_1, status: UserStatus.Pending })
      )
    } satisfies Partial<typeof userRepo>
    mockAuthRepoCreate = mock(async () => {})
    mockTeamRepo = {
      findMember: mock(async (): Promise<TeamMemberDetails | undefined> =>
        buildPendingMember()
      ),
      createMember: mock(async () => ({
        id: testUuids.MEMBERSHIP_1,
        userId: USER_1,
        teamId: TEAM_1,
        position: 'Developer',
        status: MembershipStatus.Pending,
        invitedBy: USER_2,
        joinedAt: new Date('2024-01-01'),
        lastActiveAt: new Date('2024-01-01')
      })),
      setMemberPermissions: mock(async () => {})
    } satisfies Partial<typeof teamRepo>
    mockTokenRepoIssue = mock(async () => {})
    mockRbacSet = mock(async () => {})
    mockEmailService = {
      send: mock(async () => ({ provider: 'ethereal', messageId: 'test-id' }))
    }

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo,
      userRepo: mockUserRepo,
      authRepo: { create: mockAuthRepoCreate } satisfies Partial<
        typeof authRepo
      >,
      tokenRepo: { issue: mockTokenRepoIssue } satisfies Partial<
        typeof tokenRepo
      >,
      rbacRepo: { setUserPermissions: mockRbacSet } satisfies Partial<
        typeof rbacRepo
      >,
      db: createTransactionMock()
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailService: mockEmailService
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('new email', () => {
    // The membership doesn't exist before the invite, only after it
    beforeEach(() => {
      mockTeamRepo.findMember.mockImplementation(async () =>
        buildPendingMember()
      )
    })

    it('creates a pending account with default user permissions', async () => {
      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        {
          nickname: 'john',
          email: 'john@example.com',
          status: UserStatus.Pending
        },
        expect.anything()
      )
      expect(mockAuthRepoCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_1,
          passwordHash: expect.any(String)
        }),
        expect.anything()
      )
      expect(mockRbacSet).toHaveBeenCalledWith(
        USER_1,
        getUserDefaultPermissions(),
        expect.anything()
      )
    })

    it('uses the email prefix as a placeholder nickname', async () => {
      await inviteMember(
        mockTeam,
        {
          email: 'nickname+invite@example.com',
          permissions: inviteParams.permissions
        },
        USER_2
      )

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nickname: 'nickname' }),
        expect.anything()
      )
    })

    it('adds a pending membership with the granted permissions', async () => {
      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockTeamRepo.createMember).toHaveBeenCalledWith(
        {
          userId: USER_1,
          teamId: TEAM_1,
          position: 'Developer',
          status: MembershipStatus.Pending,
          invitedBy: USER_2
        },
        expect.anything()
      )
      expect(mockTeamRepo.setMemberPermissions).toHaveBeenCalledWith(
        testUuids.MEMBERSHIP_1,
        inviteParams.permissions,
        expect.anything()
      )
    })

    it('emails an accept-invite link with a team invite token', async () => {
      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockTokenRepoIssue).toHaveBeenCalledWith(
        USER_1,
        INVITE_TOKEN_ISSUE,
        expect.anything()
      )
      expect(readSentEmail(mockEmailService.send)).toMatchObject({
        inviteUrl: expect.stringContaining(
          `${env.FE_USER_URL}/accept-invite?token=`
        ),
        hasAccount: false
      })
    })

    it('greets with the fallback instead of the placeholder nickname', async () => {
      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(readSentEmail(mockEmailService.send)).toHaveProperty(
        'nickname',
        undefined
      )
    })

    it('returns the pending member', async () => {
      const result = await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockTeamRepo.findMember).toHaveBeenCalledWith(TEAM_1, USER_1)
      expect(result.member?.status).toBe(MembershipStatus.Pending)
    })
  })

  describe('existing account', () => {
    const existingUser = buildUser({
      id: USER_1,
      nickname: 'JohnnyLabel',
      firstName: 'Johnny'
    })

    beforeEach(() => {
      mockUserRepo.findByEmail.mockImplementation(async () => existingUser)
      mockTeamRepo.findMember
        .mockImplementationOnce(async () => undefined)
        .mockImplementation(async () => buildPendingMember())
    })

    it('adds a pending membership without touching the account', async () => {
      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockTeamRepo.createMember).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_1,
          status: MembershipStatus.Pending
        }),
        expect.anything()
      )
      expect(mockTeamRepo.setMemberPermissions).toHaveBeenCalledWith(
        testUuids.MEMBERSHIP_1,
        inviteParams.permissions,
        expect.anything()
      )
      expect(mockUserRepo.create).not.toHaveBeenCalled()
      expect(mockAuthRepoCreate).not.toHaveBeenCalled()
      expect(mockRbacSet).not.toHaveBeenCalled()
    })

    it('emails an in-app link without a token', async () => {
      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockTokenRepoIssue).not.toHaveBeenCalled()
      expect(readSentEmail(mockEmailService.send)).toMatchObject({
        nickname: 'JohnnyLabel',
        inviteUrl: env.FE_USER_URL,
        hasAccount: true
      })
    })

    it('issues a team invite token when the account is still pending', async () => {
      mockUserRepo.findByEmail.mockImplementation(async () => ({
        ...existingUser,
        status: UserStatus.Pending
      }))

      await inviteMember(mockTeam, inviteParams, USER_2)

      expect(mockTokenRepoIssue).toHaveBeenCalledWith(
        USER_1,
        INVITE_TOKEN_ISSUE,
        expect.anything()
      )
      expect(readSentEmail(mockEmailService.send)).toMatchObject({
        hasAccount: false
      })
    })

    it('throws Conflict without changes when the user is already in the team', async () => {
      mockTeamRepo.findMember.mockReset()
      mockTeamRepo.findMember.mockImplementation(async () =>
        buildTeamMember(USER_1)
      )

      const error = await inviteMember(mockTeam, inviteParams, USER_2).catch(
        (error: unknown) => error
      )

      expect(error).toMatchObject({ code: ErrorCode.Conflict })
      expect(mockTeamRepo.createMember).not.toHaveBeenCalled()
      expect(mockEmailService.send).not.toHaveBeenCalled()
    })

    const notInvitable = [
      { name: 'an admin', user: { role: Role.Admin } },
      { name: 'an archived user', user: { status: UserStatus.Archived } },
      { name: 'a suspended user', user: { status: UserStatus.Suspended } }
    ]

    notInvitable.forEach(({ name, user }) => {
      it(`throws EmailAlreadyInUse without changes for ${name}`, async () => {
        mockUserRepo.findByEmail.mockImplementation(async () => ({
          ...existingUser,
          ...user
        }))

        const error = await inviteMember(mockTeam, inviteParams, USER_2).catch(
          (error: unknown) => error
        )

        expect(error).toMatchObject({ code: ErrorCode.EmailAlreadyInUse })
        expect(mockTeamRepo.createMember).not.toHaveBeenCalled()
      })
    })
  })
})

describe('resendMemberInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeam: TeamWithMemberCount
  let mockTargetMember: TeamMemberDetails
  let mockMemberAccount: User
  let mockUserRepoFindById: any
  let mockTokenRepoIssue: any
  let mockEmailService: any

  beforeEach(async () => {
    mockTeam = buildTestTeam()
    mockTargetMember = buildPendingMember()
    mockMemberAccount = buildUser({ id: USER_1, status: UserStatus.Pending })

    mockUserRepoFindById = mock(async (id: string) =>
      id === USER_2 ? buildInviter() : mockMemberAccount
    )
    mockTokenRepoIssue = mock(async () => {})
    mockEmailService = {
      send: mock(async () => ({ provider: 'ethereal', messageId: 'test-id' }))
    }

    await moduleMocker.mock('@/data', () => ({
      userRepo: { findById: mockUserRepoFindById } satisfies Partial<
        typeof userRepo
      >,
      tokenRepo: { issue: mockTokenRepoIssue } satisfies Partial<
        typeof tokenRepo
      >
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailService: mockEmailService
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('throws BadRequest when member already accepted invitation', async () => {
    mockTargetMember.status = MembershipStatus.Active

    expect(
      resendMemberInvite(mockTeam, mockTargetMember, USER_2)
    ).rejects.toMatchObject({
      code: ErrorCode.BadRequest,
      message: 'Member has already accepted invitation'
    })
  })

  it('throws NotFound when inviter is missing', async () => {
    mockUserRepoFindById.mockImplementation(async (id: string) =>
      id === USER_2 ? undefined : mockMemberAccount
    )

    expect(
      resendMemberInvite(mockTeam, mockTargetMember, USER_2)
    ).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Inviter not found'
    })
  })

  it('issues a new team invite token for a pending account', async () => {
    const result = await resendMemberInvite(mockTeam, mockTargetMember, USER_2)

    expect(mockTokenRepoIssue).toHaveBeenCalledWith(
      USER_1,
      INVITE_TOKEN_ISSUE,
      undefined
    )
    expect(readSentEmail(mockEmailService.send)).toMatchObject({
      hasAccount: false
    })
    expect(result).toEqual({ success: true })
  })

  it('emails an in-app link without a token for an existing account', async () => {
    mockMemberAccount = buildUser({ id: USER_1, status: UserStatus.Verified })

    await resendMemberInvite(mockTeam, mockTargetMember, USER_2)

    expect(mockTokenRepoIssue).not.toHaveBeenCalled()
    expect(readSentEmail(mockEmailService.send)).toMatchObject({
      inviteUrl: env.FE_USER_URL,
      hasAccount: true
    })
  })
})

describe('cancelMemberInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTargetMember: TeamMemberDetails
  let mockDeprecateTeamInvites: any
  let mockDeleteMember: any
  let mockUserUpdate: any
  let mockTransaction: any

  beforeEach(async () => {
    mockTargetMember = {
      id: USER_1,
      membershipId: testUuids.MEMBERSHIP_1,
      nickname: 'John',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: MembershipStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastActive: null,
      position: 'Developer',
      inviter: null,
      joinedAt: new Date('2024-01-01')
    }

    mockDeprecateTeamInvites = mock(async () => {})
    mockDeleteMember = mock(async () => {})
    mockUserUpdate = mock(async () => {})

    mockTransaction = mock(
      async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
        return callback({})
      }
    )

    await moduleMocker.mock('@/data', () => ({
      userRepo: { update: mockUserUpdate } satisfies Partial<typeof userRepo>,
      teamRepo: { deleteMember: mockDeleteMember } satisfies Partial<
        typeof teamRepo
      >,
      tokenRepo: {
        deprecateTeamInvites: mockDeprecateTeamInvites
      } satisfies Partial<typeof tokenRepo>,
      db: { transaction: mockTransaction } satisfies Partial<typeof db>
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('throws BadRequest when member already accepted invitation', async () => {
    mockTargetMember.status = MembershipStatus.Active

    expect(cancelMemberInvite(TEAM_1, mockTargetMember)).rejects.toMatchObject({
      code: ErrorCode.BadRequest,
      message: 'Member has already accepted invitation'
    })
  })

  it('deprecates the team invite and deletes the pending membership in a transaction', async () => {
    const result = await cancelMemberInvite(TEAM_1, mockTargetMember)

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockDeprecateTeamInvites).toHaveBeenCalledWith(
      USER_1,
      TEAM_1,
      expect.anything()
    )
    expect(mockDeleteMember).toHaveBeenCalledWith(
      USER_1,
      TEAM_1,
      expect.anything()
    )
    expect(result).toEqual({ success: true })
  })

  it('keeps the user account untouched', async () => {
    await cancelMemberInvite(TEAM_1, mockTargetMember)

    expect(mockUserUpdate).not.toHaveBeenCalled()
  })
})
