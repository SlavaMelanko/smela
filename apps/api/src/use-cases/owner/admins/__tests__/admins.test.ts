import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Inviter, rbacRepo, SearchResult, User, userRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import AppError from '@/errors/app-error'
import ErrorCode from '@/errors/codes'
import { Role, UserStatus } from '@/types'

import { getAdmin, getAdmins } from '..'

describe('getAdmins', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const DEFAULT_PAGINATION = { page: 1, limit: 25 }

  let mockSearchResult: SearchResult
  let mockUserRepo: any
  let mockRbacRepo: any

  beforeEach(async () => {
    mockSearchResult = {
      users: [
        {
          id: testUuids.ADMIN_1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: Role.Admin,
          status: UserStatus.Active,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ],
      pagination: { page: 1, limit: 25, total: 1, totalPages: 1 }
    }

    mockUserRepo = {
      search: mock(async () => mockSearchResult)
    } satisfies Partial<typeof userRepo>
    mockRbacRepo = {
      findInviters: mock(async () => new Map<string, Inviter>())
    } satisfies Partial<typeof rbacRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      rbacRepo: mockRbacRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should always search with Admin role only', async () => {
    await getAdmins({ roles: [Role.User] }, DEFAULT_PAGINATION)

    expect(mockUserRepo.search).toHaveBeenCalledWith(
      { roles: [Role.Admin] },
      DEFAULT_PAGINATION
    )
  })

  it('should return admins and pagination data', async () => {
    const result = await getAdmins({ roles: [] }, DEFAULT_PAGINATION)

    expect(result).toEqual({
      data: {
        admins: mockSearchResult.users.map(u => ({ ...u, inviter: undefined }))
      },
      pagination: mockSearchResult.pagination
    })
  })

  it('should preserve statuses in search params', async () => {
    await getAdmins(
      { roles: [], statuses: [UserStatus.Active] },
      DEFAULT_PAGINATION
    )

    expect(mockUserRepo.search).toHaveBeenCalledWith(
      { roles: [Role.Admin], statuses: [UserStatus.Active] },
      DEFAULT_PAGINATION
    )
  })

  it('should include invite info when available', async () => {
    const inviteInfo = {
      id: testUuids.OWNER_1,
      firstName: 'Owner',
      lastName: 'User'
    }
    mockRbacRepo.findInviters.mockImplementation(
      async () => new Map([[testUuids.ADMIN_1, inviteInfo]])
    )

    const result = await getAdmins({ roles: [] }, DEFAULT_PAGINATION)

    expect(mockRbacRepo.findInviters).toHaveBeenCalledWith([testUuids.ADMIN_1])
    expect(result.data.admins[0].inviter).toEqual(inviteInfo)
  })
})

describe('getAdmin', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockAdmin: User
  let mockUserRepo: any
  let mockRbacRepo: any

  beforeEach(async () => {
    mockAdmin = {
      id: testUuids.ADMIN_1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: Role.Admin,
      status: UserStatus.Active,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockUserRepo = {
      findByIdExtended: mock(async (): Promise<User | undefined> => mockAdmin)
    } satisfies Partial<typeof userRepo>
    mockRbacRepo = {
      findInviters: mock(async () => new Map<string, Inviter>())
    } satisfies Partial<typeof rbacRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      rbacRepo: mockRbacRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should return admin when found', async () => {
    const result = await getAdmin(testUuids.ADMIN_1)

    expect(mockUserRepo.findByIdExtended).toHaveBeenCalledWith(
      testUuids.ADMIN_1
    )
    expect(result).toEqual({ admin: { ...mockAdmin, inviter: undefined } })
  })

  it('should include invite info when available', async () => {
    const inviteInfo = {
      id: testUuids.OWNER_1,
      firstName: 'Owner',
      lastName: 'User'
    }
    mockRbacRepo.findInviters.mockImplementation(
      async () => new Map([[testUuids.ADMIN_1, inviteInfo]])
    )

    const result = await getAdmin(testUuids.ADMIN_1)

    expect(mockRbacRepo.findInviters).toHaveBeenCalledWith([testUuids.ADMIN_1])
    expect(result.admin.inviter).toEqual(inviteInfo)
  })

  it('should throw NotFound error when admin does not exist', async () => {
    mockUserRepo.findByIdExtended.mockImplementation(async () => undefined)

    expect(getAdmin(testUuids.NON_EXISTENT)).rejects.toThrow(AppError)
    expect(getAdmin(testUuids.NON_EXISTENT)).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })

  it('should throw NotFound error when user is not an Admin role', async () => {
    mockUserRepo.findByIdExtended.mockImplementation(async () => ({
      ...mockAdmin,
      role: Role.User
    }))

    expect(getAdmin(testUuids.ADMIN_1)).rejects.toThrow(AppError)
    expect(getAdmin(testUuids.ADMIN_1)).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })

  it('should throw NotFound error when user is Owner role', async () => {
    mockUserRepo.findByIdExtended.mockImplementation(async () => ({
      ...mockAdmin,
      role: Role.Owner
    }))

    expect(getAdmin(testUuids.ADMIN_1)).rejects.toThrow(AppError)
    expect(getAdmin(testUuids.ADMIN_1)).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'Admin not found'
    })
  })
})
