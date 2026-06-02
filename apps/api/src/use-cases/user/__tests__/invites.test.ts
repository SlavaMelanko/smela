import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { TeamMemberDetails, TeamWithMemberCount, User } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import AppError from '@/errors/app-error'
import ErrorCode from '@/errors/codes'
import { Role, UserStatus } from '@/types'

import {
  cancelMemberInvite,
  inviteMember,
  resendMemberInvite
} from '../invites'

const { TEAM_1, USER_1, USER_2 } = testUuids

describe('inviteMember', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeam: TeamWithMemberCount
  let mockInviter: User
  let mockTeamRepoFindById: any
  let mockUserRepoFindByEmail: any
  let mockUserRepoFindById: any
  let mockUserRepoCreate: any
  let mockAuthRepoCreate: any
  let mockTeamRepoCreateMember: any
  let mockTokenRepoIssue: any
  let mockRbacSet: any
  let mockTransaction: any
  let mockEmailAgent: any

  const inviteParams = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    position: 'Developer',
    permissions: {
      users: { view: true, manage: false },
      admins: { view: false, manage: false },
      teams: { view: true, manage: true }
    }
  }

  beforeEach(async () => {
    mockTeam = {
      id: TEAM_1,
      name: 'Acme Corp',
      website: 'https://acme.com',
      description: 'A test team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      memberCount: 5
    }

    mockInviter = {
      id: USER_2,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      status: UserStatus.Active,
      role: Role.Admin,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockTeamRepoFindById = mock(async () => mockTeam)
    mockUserRepoFindByEmail = mock(async () => undefined)
    mockUserRepoFindById = mock(async () => mockInviter)
    mockUserRepoCreate = mock(async () => ({
      id: USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }))
    mockAuthRepoCreate = mock(async () => {})
    mockTeamRepoCreateMember = mock(async () => {})
    mockTokenRepoIssue = mock(async () => {})
    mockRbacSet = mock(async () => {})
    mockTransaction = mock(
      async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
        return callback({})
      }
    )
    mockEmailAgent = {
      sendUserInvitationEmail: mock(async () => {})
    }

    await moduleMocker.mock('@/data', () => ({
      teamRepo: {
        findById: mockTeamRepoFindById,
        createMember: mockTeamRepoCreateMember
      },
      userRepo: {
        findByEmail: mockUserRepoFindByEmail,
        findById: mockUserRepoFindById,
        create: mockUserRepoCreate
      },
      authRepo: { create: mockAuthRepoCreate },
      tokenRepo: { issue: mockTokenRepoIssue },
      rbacRepo: { setUserPermissions: mockRbacSet },
      db: { transaction: mockTransaction }
    }))

    await moduleMocker.mock('@/security/password', () => ({
      generatePasswordHash: mock(async () => 'hashed-password')
    }))

    await moduleMocker.mock('@/security/token', () => ({
      generateToken: () => ({
        type: 'user_invite',
        token: 'invitation-token-123',
        expiresAt: new Date('2024-01-08')
      }),
      TokenType: { UserInvite: 'user_invite' }
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailAgent: mockEmailAgent
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should throw EmailAlreadyInUse when user email already exists', async () => {
    mockUserRepoFindByEmail.mockImplementation(async () => ({
      id: 'existing-user',
      email: 'john@example.com'
    }))

    expect(inviteMember(mockTeam, inviteParams, USER_2)).rejects.toThrow(
      AppError
    )
    expect(inviteMember(mockTeam, inviteParams, USER_2)).rejects.toMatchObject({
      code: ErrorCode.EmailAlreadyInUse
    })
  })

  it('should create user with pending status', async () => {
    await inviteMember(mockTeam, inviteParams, USER_2)

    expect(mockUserRepoCreate).toHaveBeenCalledWith(
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: UserStatus.Pending
      },
      expect.anything()
    )
  })

  it('should add user to team with invitedBy', async () => {
    await inviteMember(mockTeam, inviteParams, USER_2)

    expect(mockTeamRepoCreateMember).toHaveBeenCalledWith(
      {
        userId: USER_1,
        teamId: TEAM_1,
        position: 'Developer',
        invitedBy: USER_2
      },
      expect.anything()
    )
  })

  it('should send invitation email', async () => {
    await inviteMember(mockTeam, inviteParams, USER_2)

    expect(mockEmailAgent.sendUserInvitationEmail).toHaveBeenCalledWith(
      'John',
      'john@example.com',
      Role.User,
      'invitation-token-123',
      'Admin',
      'Acme Corp'
    )
  })

  it('should return member data with team details', async () => {
    const result = await inviteMember(mockTeam, inviteParams, USER_2)

    expect(result.member).toEqual({
      id: USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.Pending,
      position: 'Developer',
      invitedBy: USER_2,
      joinedAt: expect.any(Date)
    })
  })
})

describe('resendMemberInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeam: TeamWithMemberCount
  let mockTargetMember: TeamMemberDetails
  let mockInviter: User
  let mockUserRepoFindById: any
  let mockTokenRepoIssue: any
  let mockTransaction: any
  let mockEmailAgent: any

  beforeEach(async () => {
    mockTeam = {
      id: TEAM_1,
      name: 'Acme Corp',
      website: 'https://acme.com',
      description: 'A test team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      memberCount: 5
    }

    mockTargetMember = {
      id: USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastActive: null,
      position: 'Developer',
      inviter: null,
      joinedAt: new Date('2024-01-01')
    }

    mockInviter = {
      id: USER_2,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      status: UserStatus.Active,
      role: Role.Admin,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockUserRepoFindById = mock(async () => mockInviter)
    mockTokenRepoIssue = mock(async () => {})
    mockTransaction = mock(
      async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
        return callback({})
      }
    )
    mockEmailAgent = {
      sendUserInvitationEmail: mock(async () => {})
    }

    await moduleMocker.mock('@/data', () => ({
      userRepo: { findById: mockUserRepoFindById },
      tokenRepo: { issue: mockTokenRepoIssue },
      db: { transaction: mockTransaction }
    }))

    await moduleMocker.mock('@/security/token', () => ({
      generateToken: () => ({
        type: 'user_invite',
        token: 'new-invitation-token',
        expiresAt: new Date('2024-01-08')
      }),
      TokenType: { UserInvite: 'user_invite' }
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailAgent: mockEmailAgent
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should throw BadRequest when member already accepted invitation', async () => {
    mockTargetMember.status = UserStatus.Active

    expect(
      resendMemberInvite(mockTeam, mockTargetMember, USER_2)
    ).rejects.toThrow(AppError)
    expect(
      resendMemberInvite(mockTeam, mockTargetMember, USER_2)
    ).rejects.toMatchObject({
      code: ErrorCode.BadRequest,
      message: 'Member has already accepted invitation'
    })
  })

  it('should throw NotFound when inviter does not exist', async () => {
    mockUserRepoFindById.mockImplementation(async () => undefined)

    expect(
      resendMemberInvite(mockTeam, mockTargetMember, USER_2)
    ).rejects.toThrow(AppError)
    expect(
      resendMemberInvite(mockTeam, mockTargetMember, USER_2)
    ).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Inviter not found'
    })
  })

  it('should issue new token', async () => {
    await resendMemberInvite(mockTeam, mockTargetMember, USER_2)

    expect(mockTokenRepoIssue).toHaveBeenCalledWith(
      USER_1,
      {
        userId: USER_1,
        type: 'user_invite',
        token: 'new-invitation-token',
        expiresAt: expect.any(Date)
      },
      expect.anything()
    )
  })

  it('should send invitation email with current inviter name', async () => {
    await resendMemberInvite(mockTeam, mockTargetMember, USER_2)

    expect(mockEmailAgent.sendUserInvitationEmail).toHaveBeenCalledWith(
      'John',
      'john@example.com',
      Role.User,
      'new-invitation-token',
      'Admin',
      'Acme Corp'
    )
  })

  it('should return success true', async () => {
    const result = await resendMemberInvite(mockTeam, mockTargetMember, USER_2)

    expect(result).toEqual({ success: true })
  })
})

describe('cancelMemberInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTargetMember: TeamMemberDetails
  let mockTokenDeprecate: any
  let mockUserUpdate: any
  let mockTransaction: any

  beforeEach(async () => {
    mockTargetMember = {
      id: USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastActive: null,
      position: 'Developer',
      inviter: null,
      joinedAt: new Date('2024-01-01')
    }

    mockTokenDeprecate = mock(async () => {})
    mockUserUpdate = mock(async () => ({
      ...mockTargetMember,
      status: UserStatus.Archived,
      updatedAt: new Date()
    }))

    mockTransaction = mock(
      async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
        return callback({})
      }
    )

    await moduleMocker.mock('@/data', () => ({
      userRepo: { update: mockUserUpdate },
      tokenRepo: { deprecate: mockTokenDeprecate },
      db: { transaction: mockTransaction }
    }))

    await moduleMocker.mock('@/security/token', () => ({
      TokenType: { UserInvite: 'user_invite' }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should throw BadRequest when member has already accepted invitation', async () => {
    mockTargetMember.status = UserStatus.Active

    expect(cancelMemberInvite(mockTargetMember)).rejects.toThrow(AppError)
    expect(cancelMemberInvite(mockTargetMember)).rejects.toMatchObject({
      code: ErrorCode.BadRequest,
      message: 'Member has already accepted invitation'
    })
  })

  it('should deprecate token and archive user in a transaction', async () => {
    const result = await cancelMemberInvite(mockTargetMember)

    expect(mockTokenDeprecate).toHaveBeenCalledWith(
      USER_1,
      'user_invite',
      expect.anything()
    )
    expect(mockUserUpdate).toHaveBeenCalledWith(
      USER_1,
      { status: UserStatus.Archived },
      expect.anything()
    )
    expect(result).toEqual({ success: true })
  })
})
