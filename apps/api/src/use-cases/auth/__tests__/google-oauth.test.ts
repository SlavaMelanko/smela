import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  AuthRecord,
  authRepo,
  rbacRepo,
  refreshTokenRepo,
  teamRepo,
  User,
  userRepo
} from '@/data'

import {
  buildUser,
  createTransactionMock,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { verifyJwt } from '@/security/jwt'
import { hashToken } from '@/security/token'
import {
  AuthProvider,
  getSelfServeUserDefaultPermissions,
  UserStatus
} from '@/types'

import { completeGoogleOAuth, logInOrSignUpWithGoogle } from '../google-oauth'

describe('google-oauth', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const mockDeviceInfo = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test)'
  }

  const mockGoogleProfile = {
    googleId: 'google-id-123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
  }

  let mockUser: User
  let mockUserRepo: any
  let mockAuthRepo: any
  let mockAuthRecord: AuthRecord
  let mockRbacRepo: any
  let mockRefreshTokenRepo: any
  let mockTeamRepo: any
  let mockTransaction: ReturnType<typeof createTransactionMock>

  let mockResolvePermissions: any

  beforeEach(async () => {
    mockUser = buildUser()

    mockAuthRecord = {
      userId: testUuids.USER_1,
      provider: AuthProvider.Google,
      identifier: 'google-id-123',
      passwordHash: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockUserRepo = {
      findById: mock(async () => mockUser),
      findByEmail: mock(async () => undefined),
      create: mock(async () => mockUser),
      update: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>

    mockAuthRepo = {
      findByProvider: mock(async () => mockAuthRecord),
      create: mock(async () => {})
    } satisfies Partial<typeof authRepo>

    mockRbacRepo = {
      setUserPermissions: mock(async () => {})
    } satisfies Partial<typeof rbacRepo>

    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    } satisfies Partial<typeof refreshTokenRepo>

    mockTeamRepo = {
      findUserTeam: mock(async () => undefined)
    } satisfies Partial<typeof teamRepo>

    mockTransaction = createTransactionMock()

    await moduleMocker.mock('@/data', () => ({
      authRepo: mockAuthRepo,
      db: mockTransaction,
      rbacRepo: mockRbacRepo,
      refreshTokenRepo: mockRefreshTokenRepo,
      teamRepo: mockTeamRepo,
      userRepo: mockUserRepo
    }))

    mockResolvePermissions = mock(async () => undefined)

    await moduleMocker.mock('../../resolve-permissions', () => ({
      resolvePermissionList: mockResolvePermissions
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('logs in returning Google user without creating new records', async () => {
    const result = await logInOrSignUpWithGoogle(
      mockGoogleProfile,
      mockDeviceInfo
    )

    expect(mockAuthRepo.findByProvider).toHaveBeenCalledWith(
      AuthProvider.Google,
      mockGoogleProfile.googleId
    )
    expect(mockUserRepo.findById).toHaveBeenCalledWith(mockAuthRecord.userId)
    expect(mockTransaction.transaction).not.toHaveBeenCalled()
    expect(result.data.user).toEqual(mockUser)
  })

  it('includes team when returning user belongs to one', async () => {
    const mockTeam = { id: 'team-1', name: 'Acme', position: 'Engineer' }
    mockTeamRepo.findUserTeam.mockImplementation(async () => mockTeam)

    const result = await logInOrSignUpWithGoogle(
      mockGoogleProfile,
      mockDeviceInfo
    )

    expect(result.data.team).toEqual(mockTeam)
    expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(mockUser.id)
  })

  describe('when Google user has no account', () => {
    beforeEach(() => {
      mockAuthRepo.findByProvider.mockImplementation(async () => null)
      mockUserRepo.findByEmail.mockImplementation(async () => null)
    })

    it('creates user and Google auth record in a transaction', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        {
          firstName: mockGoogleProfile.firstName,
          lastName: mockGoogleProfile.lastName,
          email: mockGoogleProfile.email,
          status: UserStatus.Verified
        },
        expect.anything()
      )
      expect(mockAuthRepo.create).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          provider: AuthProvider.Google,
          identifier: mockGoogleProfile.googleId
        },
        expect.anything()
      )
    })

    it('grants default permissions to new user', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockRbacRepo.setUserPermissions).toHaveBeenCalledTimes(1)
      expect(mockRbacRepo.setUserPermissions).toHaveBeenCalledWith(
        mockUser.id,
        getSelfServeUserDefaultPermissions(),
        expect.anything()
      )
    })

    it('returns user data with a signed access token', async () => {
      const result = await logInOrSignUpWithGoogle(
        mockGoogleProfile,
        mockDeviceInfo
      )

      expect(result.data.user).toEqual(mockUser)
      expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        status: mockUser.status
      })
    })

    it('stores only the hash of the returned refresh token', async () => {
      const result = await logInOrSignUpWithGoogle(
        mockGoogleProfile,
        mockDeviceInfo
      )

      expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          tokenHash: await hashToken(result.refreshToken),
          expiresAt: expect.any(Date)
        }),
        undefined
      )
    })
  })

  describe('when email user links Google account', () => {
    let existingEmailUser: User

    beforeEach(() => {
      existingEmailUser = {
        ...mockUser,
        status: UserStatus.New
      }

      mockAuthRepo.findByProvider.mockImplementation(async () => null)
      mockUserRepo.findByEmail.mockImplementation(async () => existingEmailUser)
      mockUserRepo.update.mockImplementation(async () => ({
        ...existingEmailUser,
        status: UserStatus.Verified
      }))
    })

    it('links Google auth to existing email account', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
      expect(mockUserRepo.create).not.toHaveBeenCalled()
      expect(mockAuthRepo.create).toHaveBeenCalledWith(
        {
          userId: existingEmailUser.id,
          provider: AuthProvider.Google,
          identifier: mockGoogleProfile.googleId
        },
        expect.anything()
      )
    })

    it('verifies New user status after Google verification', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        existingEmailUser.id,
        { status: UserStatus.Verified },
        expect.anything()
      )
    })

    it('does not update status for already-verified user', async () => {
      mockUserRepo.findByEmail.mockImplementation(async () => ({
        ...existingEmailUser,
        status: UserStatus.Verified
      }))

      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockUserRepo.update).not.toHaveBeenCalled()
    })

    it('sets default permissions once', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockRbacRepo.setUserPermissions).toHaveBeenCalledTimes(1)
    })
  })

  it('signs up in a transaction when Google auth record points to missing user', async () => {
    mockAuthRepo.findByProvider.mockImplementation(async () => ({
      ...mockAuthRecord,
      userId: testUuids.USER_2
    }))
    mockUserRepo.findById.mockImplementation(async () => null)
    mockUserRepo.findByEmail.mockImplementation(async () => null)
    mockUserRepo.create.mockImplementation(async () => mockUser)

    await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
  })

  it('creates user from profile without lastName', async () => {
    const profileWithoutLastName = {
      ...mockGoogleProfile,
      lastName: undefined
    }
    mockAuthRepo.findByProvider.mockImplementation(async () => null)
    mockUserRepo.findByEmail.mockImplementation(async () => null)

    await logInOrSignUpWithGoogle(profileWithoutLastName, mockDeviceInfo)

    expect(mockUserRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ lastName: undefined }),
      expect.anything()
    )
  })

  describe('completeGoogleOAuth', () => {
    let mockExchangeCodeForProfile: any

    beforeEach(async () => {
      mockExchangeCodeForProfile = mock(async () => ({
        id: 'google-id-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }))

      await moduleMocker.mock('@/services/google', () => ({
        exchangeCodeForProfile: mockExchangeCodeForProfile
      }))
    })

    it('exchanges code and logs the user in', async () => {
      const result = await completeGoogleOAuth('auth-code', mockDeviceInfo)

      expect(mockExchangeCodeForProfile).toHaveBeenCalledWith('auth-code')
      expect(mockAuthRepo.findByProvider).toHaveBeenCalledWith(
        AuthProvider.Google,
        'google-id-123'
      )
      expect(result).toEqual({
        isNew: false,
        refreshToken: expect.any(String)
      })
    })

    it('propagates profile exchange failure', async () => {
      mockExchangeCodeForProfile.mockImplementation(async () => {
        throw new Error('Google token exchange failed')
      })

      expect(completeGoogleOAuth('bad-code', mockDeviceInfo)).rejects.toThrow(
        'Google token exchange failed'
      )
    })
  })
})
