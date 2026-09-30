import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock
} from 'bun:test'

import type {
  AuthRecord,
  authRepo,
  db,
  refreshTokenRepo,
  teamRepo,
  UpdateUserInput,
  User,
  userRepo,
  UserTeamInfo
} from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'
import { comparePasswordHashes, hashPassword } from '@/security/password'
import { hashToken } from '@/security/token'
import { AuthProvider, Role, UserStatus } from '@/types'

import { changePassword, getUser, updateUser } from '../me'

describe('User Me Use Cases', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockUser: User
  let mockUserRepo: any
  let mockTeamRepo: any
  let mockTeam: UserTeamInfo | undefined
  let mockResolvePermissions: any

  beforeEach(async () => {
    mockUser = {
      id: testUuids.USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      role: Role.User,
      status: UserStatus.Active,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
    mockUserRepo = {
      findById: mock(async () => mockUser),
      update: mock(async (_id: string, updates: UpdateUserInput) => ({
        ...mockUser,
        ...updates
      }))
    } satisfies Partial<typeof userRepo>
    mockTeam = undefined
    mockTeamRepo = {
      findUserTeam: mock(async () => mockTeam)
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      teamRepo: mockTeamRepo
    }))

    mockResolvePermissions = mock(async () => undefined)

    await moduleMocker.mock('../../resolve-permissions', () => ({
      resolvePermissionList: mockResolvePermissions
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('getUser', () => {
    it('should return user, team undefined, and permissions when user has no team', async () => {
      const result = await getUser(testUuids.USER_1)

      expect(result).toEqual({
        user: mockUser,
        team: undefined,
        permissions: undefined
      })
      expect(mockUserRepo.findById).toHaveBeenCalledWith(testUuids.USER_1)
      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(testUuids.USER_1)
    })

    it('should return user, team info, and permissions when user belongs to a team', async () => {
      mockTeam = {
        id: 'team-789',
        name: 'My Team',
        position: 'Product Manager'
      }
      mockTeamRepo.findUserTeam.mockImplementation(async () => mockTeam)

      const result = await getUser(testUuids.USER_1)

      expect(result).toEqual({
        user: mockUser,
        team: mockTeam,
        permissions: undefined
      })
      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(testUuids.USER_1)
    })

    it('should throw InternalError when user not found', async () => {
      mockUserRepo.findById.mockImplementation(async () => null)

      expect(getUser(testUuids.NON_EXISTENT)).rejects.toThrow(AppError)
      expect(getUser(testUuids.NON_EXISTENT)).rejects.toMatchObject({
        code: ErrorCode.InternalError
      })
    })
  })

  describe('changePassword', () => {
    const CURRENT_PASSWORD = 'OldPass1!'
    const NEW_PASSWORD = 'NewPass1!'
    let currentPasswordHash: string

    let mockAuthRecord: AuthRecord
    let mockAuthRepo: any
    let mockRefreshTokenRepo: any
    let mockTransaction: any

    beforeAll(async () => {
      currentPasswordHash = await hashPassword(CURRENT_PASSWORD)
    })

    beforeEach(async () => {
      mockAuthRecord = {
        userId: testUuids.USER_1,
        provider: AuthProvider.Local,
        identifier: mockUser.email,
        passwordHash: currentPasswordHash,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
      mockAuthRepo = {
        findById: mock(async () => mockAuthRecord),
        update: mock(async () => undefined)
      } satisfies Partial<typeof authRepo>
      mockRefreshTokenRepo = {
        revokeByUserId: mock(async () => undefined)
      } satisfies Partial<typeof refreshTokenRepo>
      mockTransaction = mock(
        async (callback: any) => callback({}) as Promise<void>
      )

      await moduleMocker.mock('@/data', () => ({
        authRepo: mockAuthRepo,
        refreshTokenRepo: mockRefreshTokenRepo,
        userRepo: mockUserRepo,
        teamRepo: mockTeamRepo,
        db: { transaction: mockTransaction } satisfies Partial<typeof db>
      }))
    })

    it('should update passwordHash and return success when current password is valid', async () => {
      const result = await changePassword(
        testUuids.USER_1,
        CURRENT_PASSWORD,
        NEW_PASSWORD
      )

      expect(result).toEqual({ success: true })
      expect(mockAuthRepo.update).toHaveBeenCalledWith(
        testUuids.USER_1,
        { passwordHash: expect.any(String) },
        {}
      )

      const [, { passwordHash }] = mockAuthRepo.update.mock.calls[0]

      expect(comparePasswordHashes(NEW_PASSWORD, passwordHash)).resolves.toBe(
        true
      )
    })

    it('should revoke other sessions excluding current refresh token', async () => {
      await changePassword(
        testUuids.USER_1,
        CURRENT_PASSWORD,
        NEW_PASSWORD,
        'raw-token'
      )

      expect(mockRefreshTokenRepo.revokeByUserId).toHaveBeenCalledWith(
        testUuids.USER_1,
        await hashToken('raw-token'),
        {}
      )
    })

    it('should revoke all sessions when no refresh token provided', async () => {
      await changePassword(testUuids.USER_1, CURRENT_PASSWORD, NEW_PASSWORD)

      expect(mockRefreshTokenRepo.revokeByUserId).toHaveBeenCalledWith(
        testUuids.USER_1,
        undefined,
        {}
      )
    })

    it('should throw InvalidCredentials when auth record is not found', async () => {
      mockAuthRepo.findById.mockImplementation(async () => null)

      expect(
        changePassword(testUuids.USER_1, CURRENT_PASSWORD, NEW_PASSWORD)
      ).rejects.toMatchObject({
        code: ErrorCode.InvalidCredentials
      })
    })

    it('should throw InvalidCredentials when auth has no passwordHash', async () => {
      mockAuthRepo.findById.mockImplementation(async () => ({
        passwordHash: null
      }))

      expect(
        changePassword(testUuids.USER_1, CURRENT_PASSWORD, NEW_PASSWORD)
      ).rejects.toMatchObject({
        code: ErrorCode.InvalidCredentials
      })
    })

    it('should throw InvalidPassword when current password does not match', async () => {
      expect(
        changePassword(testUuids.USER_1, 'WrongPass1!', NEW_PASSWORD)
      ).rejects.toMatchObject({
        code: ErrorCode.InvalidPassword
      })
    })
  })

  describe('updateUser', () => {
    it('should update user with firstName and lastName', async () => {
      const result = await updateUser(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: 'Smith'
      })

      expect(result.user.firstName).toBe('Jane')
      expect(result.user.lastName).toBe('Smith')
      expect(result.team).toBeUndefined()
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: 'Smith',
        updatedAt: expect.any(Date)
      })
    })

    it('should update user with only firstName', async () => {
      const result = await updateUser(testUuids.USER_1, { firstName: 'Jane' })

      expect(result.user.firstName).toBe('Jane')
      expect(result.team).toBeUndefined()
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUuids.USER_1, {
        firstName: 'Jane',
        updatedAt: expect.any(Date)
      })
    })

    it('should update user with only lastName', async () => {
      const result = await updateUser(testUuids.USER_1, { lastName: 'Smith' })

      expect(result.user.lastName).toBe('Smith')
      expect(result.team).toBeUndefined()
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUuids.USER_1, {
        lastName: 'Smith',
        updatedAt: expect.any(Date)
      })
    })

    it('should return current user, team, and permissions when no valid updates provided', async () => {
      const result = await updateUser(testUuids.USER_1, {})

      expect(result).toEqual({
        user: mockUser,
        team: undefined,
        permissions: undefined
      })
      expect(mockUserRepo.update).not.toHaveBeenCalled()
      expect(mockUserRepo.findById).toHaveBeenCalledWith(testUuids.USER_1)
    })

    it('should allow clearing lastName with empty string', async () => {
      // lastName: '' is valid (clears the field)
      const result = await updateUser(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: ''
      })

      expect(result.user.firstName).toBe('Jane')
      expect(result.user.lastName).toBe('')
      expect(result.team).toBeUndefined()
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: '',
        updatedAt: expect.any(Date)
      })
    })

    it('should filter undefined values only', async () => {
      // undefined = don't touch, empty string = include
      const result = await updateUser(testUuids.USER_1, {
        firstName: undefined,
        lastName: 'Smith'
      })

      expect(result.user.lastName).toBe('Smith')
      expect(result.team).toBeUndefined()
      expect(mockUserRepo.update).toHaveBeenCalledWith(testUuids.USER_1, {
        lastName: 'Smith',
        updatedAt: expect.any(Date)
      })
    })
  })
})
