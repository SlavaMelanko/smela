import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { authRepo, db, rbacRepo, tokenRepo, User, userRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import AppError from '@/errors/app-error'
import ErrorCode from '@/errors/codes'
import { TokenType } from '@/security/token'
import { UserInviteEmailMessageBuilder } from '@/services/email'
import { Role, UserStatus } from '@/types'

import { cancelAdminInvite, inviteAdmin, resendAdminInvite } from '../invites'

describe('inviteAdmin', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockAdmin: User
  let mockFindByEmail: any
  let mockUserCreate: any
  let mockUserFindById: any
  let mockUserRoleAssign: any
  let mockAuthCreate: any
  let mockTokenIssue: any
  let mockRbacSet: any
  let mockTransaction: any
  let mockSendUserInviteEmail: any

  const inviteAdminParams = {
    firstName: 'New',
    lastName: 'Admin',
    email: 'newadmin@example.com',
    permissions: {
      users: { view: true, manage: false },
      admins: { view: true, manage: false },
      teams: { view: false, manage: false }
    }
  }

  beforeEach(async () => {
    mockAdmin = {
      id: testUuids.ADMIN_1,
      firstName: 'New',
      lastName: 'Admin',
      email: 'newadmin@example.com',
      role: Role.Admin,
      status: UserStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockFindByEmail = mock(async () => undefined)
    mockUserCreate = mock(async () => mockAdmin)
    mockUserFindById = mock(async () => mockAdmin)
    mockUserRoleAssign = mock(async () => ({}))
    mockAuthCreate = mock(async () => ({}))
    mockTokenIssue = mock(async () => ({}))
    mockRbacSet = mock(async () => {})
    mockSendUserInviteEmail = mock(async () => {})

    // eslint-disable-next-line ts/no-unsafe-return
    mockTransaction = mock(async (callback: any) => callback({}))

    await moduleMocker.mock('@/data', () => ({
      userRepo: {
        findByEmail: mockFindByEmail,
        findById: mockUserFindById,
        create: mockUserCreate
      } satisfies Partial<typeof userRepo>,
      rbacRepo: {
        assignRole: mockUserRoleAssign,
        setUserPermissions: mockRbacSet
      } satisfies Partial<typeof rbacRepo>,
      authRepo: { create: mockAuthCreate } satisfies Partial<typeof authRepo>,
      tokenRepo: { issue: mockTokenIssue } satisfies Partial<typeof tokenRepo>,
      db: { transaction: mockTransaction } satisfies Partial<typeof db>
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailService: { send: mockSendUserInviteEmail }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('throws EmailAlreadyInUse when email exists', async () => {
    mockFindByEmail.mockImplementation(async () => mockAdmin)

    expect(inviteAdmin(inviteAdminParams, testUuids.OWNER_1)).rejects.toThrow(
      AppError
    )
    expect(
      inviteAdmin(inviteAdminParams, testUuids.OWNER_1)
    ).rejects.toMatchObject({
      code: ErrorCode.EmailAlreadyInUse
    })
  })

  it('creates admin with pending status and returns admin data', async () => {
    const result = await inviteAdmin(inviteAdminParams, testUuids.OWNER_1)

    expect(mockUserCreate).toHaveBeenCalledWith(
      {
        firstName: 'New',
        lastName: 'Admin',
        email: 'newadmin@example.com',
        status: UserStatus.Pending
      },
      expect.anything()
    )
    expect(mockUserRoleAssign).toHaveBeenCalledWith(
      {
        userId: mockAdmin.id,
        role: Role.Admin,
        invitedBy: testUuids.OWNER_1
      },
      expect.anything()
    )
    expect(result).toEqual({ admin: mockAdmin })
  })

  it('stores a random password hash and issues an invite token', async () => {
    await inviteAdmin(inviteAdminParams, testUuids.OWNER_1)

    expect(mockAuthCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockAdmin.id,
        passwordHash: expect.any(String)
      }),
      expect.anything()
    )
    expect(mockTokenIssue).toHaveBeenCalledWith(
      mockAdmin.id,
      {
        userId: mockAdmin.id,
        type: TokenType.UserInvite,
        token: expect.any(String),
        expiresAt: expect.any(Date)
      },
      expect.anything()
    )
  })

  it('sends the invite email', async () => {
    await inviteAdmin(inviteAdminParams, testUuids.OWNER_1)

    expect(mockSendUserInviteEmail).toHaveBeenCalledWith(
      expect.any(UserInviteEmailMessageBuilder)
    )
  })
})

describe('resendAdminInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockAdmin: User
  let mockInviter: User
  let mockFindById: any
  let mockTokenIssue: any
  let mockTransaction: any
  let mockSendUserInviteEmail: any

  beforeEach(async () => {
    mockAdmin = {
      id: testUuids.ADMIN_1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: Role.Admin,
      status: UserStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockInviter = {
      id: testUuids.OWNER_1,
      firstName: 'Owner',
      lastName: 'User',
      email: 'owner@example.com',
      role: Role.Owner,
      status: UserStatus.Active,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockFindById = mock(async (id: string) => {
      if (id === testUuids.ADMIN_1) {
        return mockAdmin
      }
      if (id === testUuids.OWNER_1) {
        return mockInviter
      }

      return undefined
    })
    mockTokenIssue = mock(async () => ({}))
    mockSendUserInviteEmail = mock(async () => {})

    // eslint-disable-next-line ts/no-unsafe-return
    mockTransaction = mock(async (callback: any) => callback({}))

    await moduleMocker.mock('@/data', () => ({
      userRepo: { findById: mockFindById } satisfies Partial<typeof userRepo>,
      tokenRepo: { issue: mockTokenIssue } satisfies Partial<typeof tokenRepo>,
      db: { transaction: mockTransaction } satisfies Partial<typeof db>
    }))

    await moduleMocker.mock('@/services/email', () => ({
      emailService: { send: mockSendUserInviteEmail }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('throws NotFound when admin is missing', async () => {
    mockFindById.mockImplementation(async (id: string) => {
      if (id === testUuids.OWNER_1) {
        return mockInviter
      }

      return undefined
    })

    expect(
      resendAdminInvite(testUuids.NON_EXISTENT, testUuids.OWNER_1)
    ).rejects.toThrow(AppError)
    expect(
      resendAdminInvite(testUuids.NON_EXISTENT, testUuids.OWNER_1)
    ).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })

  it('throws NotFound when user is not Admin role', async () => {
    mockFindById.mockImplementation(async (id: string) => {
      if (id === testUuids.ADMIN_1) {
        return { ...mockAdmin, role: Role.User }
      }
      if (id === testUuids.OWNER_1) {
        return mockInviter
      }

      return undefined
    })

    expect(
      resendAdminInvite(testUuids.ADMIN_1, testUuids.OWNER_1)
    ).rejects.toThrow(AppError)
    expect(
      resendAdminInvite(testUuids.ADMIN_1, testUuids.OWNER_1)
    ).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })

  it('throws BadRequest when admin already accepted invitation', async () => {
    mockFindById.mockImplementation(async (id: string) => {
      if (id === testUuids.ADMIN_1) {
        return { ...mockAdmin, status: UserStatus.Active }
      }
      if (id === testUuids.OWNER_1) {
        return mockInviter
      }

      return undefined
    })

    expect(
      resendAdminInvite(testUuids.ADMIN_1, testUuids.OWNER_1)
    ).rejects.toThrow(AppError)
    expect(
      resendAdminInvite(testUuids.ADMIN_1, testUuids.OWNER_1)
    ).rejects.toMatchObject({
      code: ErrorCode.BadRequest,
      message: 'Admin has already accepted invitation'
    })
  })

  it('throws NotFound when inviter is missing', async () => {
    mockFindById.mockImplementation(async (id: string) => {
      if (id === testUuids.ADMIN_1) {
        return mockAdmin
      }

      return undefined
    })

    expect(
      resendAdminInvite(testUuids.ADMIN_1, testUuids.NON_EXISTENT)
    ).rejects.toThrow(AppError)
    expect(
      resendAdminInvite(testUuids.ADMIN_1, testUuids.NON_EXISTENT)
    ).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Inviter not found'
    })
  })

  it('issues new token and sends invite email with current inviter name', async () => {
    const result = await resendAdminInvite(testUuids.ADMIN_1, testUuids.OWNER_1)

    expect(mockTokenIssue).toHaveBeenCalledWith(
      testUuids.ADMIN_1,
      {
        userId: testUuids.ADMIN_1,
        type: TokenType.UserInvite,
        token: expect.any(String),
        expiresAt: expect.any(Date)
      },
      expect.anything()
    )
    expect(mockSendUserInviteEmail).toHaveBeenCalledWith(
      expect.any(UserInviteEmailMessageBuilder)
    )
    expect(result).toEqual({ success: true })
  })
})

describe('cancelAdminInvite', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockAdmin: User
  let mockFindById: any
  let mockTokenDeprecate: any
  let mockUserUpdate: any
  let mockTransaction: any

  beforeEach(async () => {
    mockAdmin = {
      id: testUuids.ADMIN_1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: Role.Admin,
      status: UserStatus.Pending,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockFindById = mock(async () => mockAdmin)
    mockTokenDeprecate = mock(async () => {})
    mockUserUpdate = mock(async () => ({
      ...mockAdmin,
      status: UserStatus.Archived
    }))

    // eslint-disable-next-line ts/no-unsafe-return
    mockTransaction = mock(async (callback: any) => callback({}))

    await moduleMocker.mock('@/data', () => ({
      userRepo: {
        findById: mockFindById,
        update: mockUserUpdate
      } satisfies Partial<typeof userRepo>,
      tokenRepo: { deprecate: mockTokenDeprecate } satisfies Partial<
        typeof tokenRepo
      >,
      db: { transaction: mockTransaction } satisfies Partial<typeof db>
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('throws NotFound when admin is missing', async () => {
    mockFindById.mockImplementation(async () => undefined)

    expect(cancelAdminInvite(testUuids.NON_EXISTENT)).rejects.toThrow(AppError)
    expect(cancelAdminInvite(testUuids.NON_EXISTENT)).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })

  it('throws NotFound when user is not Admin role', async () => {
    mockFindById.mockImplementation(async () => ({
      ...mockAdmin,
      role: Role.User
    }))

    expect(cancelAdminInvite(testUuids.ADMIN_1)).rejects.toThrow(AppError)
    expect(cancelAdminInvite(testUuids.ADMIN_1)).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })

  it('throws BadRequest when admin already accepted invitation', async () => {
    mockFindById.mockImplementation(async () => ({
      ...mockAdmin,
      status: UserStatus.Active
    }))

    expect(cancelAdminInvite(testUuids.ADMIN_1)).rejects.toThrow(AppError)
    expect(cancelAdminInvite(testUuids.ADMIN_1)).rejects.toMatchObject({
      code: ErrorCode.BadRequest,
      message: 'Admin has already accepted invitation'
    })
  })

  it('deprecates token and archives user in a transaction', async () => {
    const result = await cancelAdminInvite(testUuids.ADMIN_1)

    expect(mockTokenDeprecate).toHaveBeenCalledWith(
      testUuids.ADMIN_1,
      TokenType.UserInvite,
      expect.anything()
    )
    expect(mockUserUpdate).toHaveBeenCalledWith(
      testUuids.ADMIN_1,
      { status: UserStatus.Archived },
      expect.anything()
    )
    expect(result).toEqual({ success: true })
  })
})
