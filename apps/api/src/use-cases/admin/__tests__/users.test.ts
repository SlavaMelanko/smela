import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { SearchResult, User, userRepo } from '@/data'

import { buildUser, ModuleMocker, testUuids } from '@/__tests__'
import AppError from '@/errors/app-error'
import ErrorCode from '@/errors/codes'
import { Role, UserStatus } from '@/types'

import { getUser, searchUsers } from '../users'

describe('searchUsers', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const DEFAULT_PAGINATION = { page: 1, limit: 25 }

  let mockSearchResult: SearchResult
  let mockUserRepo: any

  beforeEach(async () => {
    mockSearchResult = {
      users: [
        {
          id: testUuids.USER_1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: Role.User,
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

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('filters out admin roles from search params', async () => {
    await searchUsers(
      { roles: [Role.Admin, Role.User, Role.Owner] },
      DEFAULT_PAGINATION
    )

    expect(mockUserRepo.search).toHaveBeenCalledWith(
      { roles: [Role.User] },
      DEFAULT_PAGINATION
    )
  })

  it('defaults to user roles when all roles are filtered out', async () => {
    await searchUsers({ roles: [Role.Admin, Role.Owner] }, DEFAULT_PAGINATION)

    expect(mockUserRepo.search).toHaveBeenCalledWith(
      { roles: [Role.User] },
      DEFAULT_PAGINATION
    )
  })

  it('returns users and pagination data', async () => {
    const result = await searchUsers({ roles: [Role.User] }, DEFAULT_PAGINATION)

    expect(result).toEqual({
      data: { users: mockSearchResult.users },
      pagination: mockSearchResult.pagination
    })
  })

  it('preserves statuses in search params', async () => {
    await searchUsers(
      { roles: [Role.User], statuses: [UserStatus.Active, UserStatus.Active] },
      DEFAULT_PAGINATION
    )

    expect(mockUserRepo.search).toHaveBeenCalledWith(
      { roles: [Role.User], statuses: [UserStatus.Active, UserStatus.Active] },
      DEFAULT_PAGINATION
    )
  })
})

describe('getUser', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockUser: User
  let mockUserRepo: any

  beforeEach(async () => {
    mockUser = buildUser({ status: UserStatus.Active })

    mockUserRepo = {
      findByIdExtended: mock(async (): Promise<User | undefined> => mockUser)
    } satisfies Partial<typeof userRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('returns user when found', async () => {
    const result = await getUser(testUuids.USER_1)

    expect(mockUserRepo.findByIdExtended).toHaveBeenCalledWith(testUuids.USER_1)
    expect(result).toEqual({ user: mockUser })
  })

  it('throws NotFound when user is missing', async () => {
    mockUserRepo.findByIdExtended.mockImplementation(async () => undefined)

    expect(getUser(testUuids.NON_EXISTENT)).rejects.toThrow(AppError)
    expect(getUser(testUuids.NON_EXISTENT)).rejects.toMatchObject({
      code: ErrorCode.NotFound,
      message: 'User not found'
    })
  })
})
