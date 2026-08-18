import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { AuthRecord, User } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { AuthProvider, Role, UserStatus } from '@/types'

import { completeGoogleOAuth, logInOrSignUpWithGoogle } from '../google-oauth'

describe('Google OAuth', () => {
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
  let mockTransaction: any

  let mockJwtToken: string
  let mockCreateJwt: any
  let mockGenerateHashedToken: any
  let mockResolvePermissions: any

  beforeEach(async () => {
    mockUser = {
      id: testUuids.USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.Active,
      role: Role.User,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

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
      findByEmail: mock(async () => null),
      create: mock(async () => mockUser),
      update: mock(async () => mockUser)
    }

    mockAuthRepo = {
      findByProvider: mock(async () => mockAuthRecord),
      create: mock(async () => 1)
    }

    mockRbacRepo = {
      setUserPermissions: mock(async () => {})
    }

    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    }

    mockTeamRepo = {
      findUserTeam: mock(async () => undefined)
    }

    mockTransaction = {
      transaction: mock(
        async (callback: any) => callback({}) as Promise<unknown>
      )
    }

    await moduleMocker.mock('@/data', () => ({
      authRepo: mockAuthRepo,
      db: mockTransaction,
      rbacRepo: mockRbacRepo,
      refreshTokenRepo: mockRefreshTokenRepo,
      teamRepo: mockTeamRepo,
      userRepo: mockUserRepo
    }))

    mockJwtToken = 'google-oauth-jwt-token'
    mockCreateJwt = mock(async () => mockJwtToken)

    await moduleMocker.mock('@/security/jwt', () => ({
      signJwt: mockCreateJwt
    }))

    mockGenerateHashedToken = mock(async () => ({
      token: { raw: 'refresh_token_123', hashed: 'hashed_refresh_token_123' },
      expiresAt: new Date('2024-02-01'),
      type: 'refresh_token'
    }))

    await moduleMocker.mock('@/security/token', () => ({
      generateHashedToken: mockGenerateHashedToken,
      TokenType: { RefreshToken: 'refresh_token' }
    }))

    mockResolvePermissions = mock(async () => undefined)

    await moduleMocker.mock('../../resolve-permissions', () => ({
      resolvePermissionList: mockResolvePermissions
    }))

    await moduleMocker.mock('@/types', () => ({
      AuthProvider,
      Role,
      UserStatus,
      getSelfServeUserDefaultPermissions: mock(() => ({
        dashboard: { view: true, manage: true }
      }))
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('returning user (Google auth record exists)', () => {
    it('should return existing user without creating new records', async () => {
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
      expect(result.data.accessToken).toBe(mockJwtToken)
      expect(result.refreshToken).toBe('refresh_token_123')
    })

    it('should include team when user belongs to one', async () => {
      const mockTeam = { id: 'team-1', name: 'Acme', position: 'Engineer' }
      mockTeamRepo.findUserTeam.mockImplementation(async () => mockTeam)

      const result = await logInOrSignUpWithGoogle(
        mockGoogleProfile,
        mockDeviceInfo
      )

      expect(result.data.team).toEqual(mockTeam)
      expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(mockUser.id)
    })
  })

  describe('new Google user (no prior account)', () => {
    beforeEach(() => {
      mockAuthRepo.findByProvider.mockImplementation(async () => null)
      mockUserRepo.findByEmail.mockImplementation(async () => null)
    })

    it('should create user and Google auth record in a transaction', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        {
          firstName: mockGoogleProfile.firstName,
          lastName: mockGoogleProfile.lastName,
          email: mockGoogleProfile.email,
          status: UserStatus.Active
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

    it('should grant default permissions to new user', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockRbacRepo.setUserPermissions).toHaveBeenCalledTimes(1)
      expect(mockRbacRepo.setUserPermissions).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Object),
        expect.anything()
      )
    })

    it('should return tokens and user data', async () => {
      const result = await logInOrSignUpWithGoogle(
        mockGoogleProfile,
        mockDeviceInfo
      )

      expect(result.data.accessToken).toBe(mockJwtToken)
      expect(result.refreshToken).toBe('refresh_token_123')
      expect(result.data.user).toEqual(mockUser)
    })
  })

  describe('email signup → Google OAuth (account linking)', () => {
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
        status: UserStatus.Active
      }))
    })

    it('should link Google auth to existing email account', async () => {
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

    it('should activate New user status after Google verification', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        existingEmailUser.id,
        { status: UserStatus.Active },
        expect.anything()
      )
    })

    it('should not update status for already-active user', async () => {
      mockUserRepo.findByEmail.mockImplementation(async () => ({
        ...existingEmailUser,
        status: UserStatus.Active
      }))

      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockUserRepo.update).not.toHaveBeenCalled()
    })

    it('should not grant permissions again (existing account already has them)', async () => {
      await logInOrSignUpWithGoogle(mockGoogleProfile, mockDeviceInfo)

      expect(mockRbacRepo.setUserPermissions).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle missing Google auth record but user not found in DB', async () => {
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

    it('should handle profile without lastName', async () => {
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

    it('should exchange code and log the user in', async () => {
      const result = await completeGoogleOAuth('auth-code', mockDeviceInfo)

      expect(mockExchangeCodeForProfile).toHaveBeenCalledWith('auth-code')
      expect(mockAuthRepo.findByProvider).toHaveBeenCalledWith(
        AuthProvider.Google,
        'google-id-123'
      )
      expect(result).toEqual({
        isNew: false,
        refreshToken: 'refresh_token_123'
      })
    })

    it('should propagate profile exchange failure', async () => {
      mockExchangeCodeForProfile.mockImplementation(async () => {
        throw new Error('Google token exchange failed')
      })

      expect(completeGoogleOAuth('bad-code', mockDeviceInfo)).rejects.toThrow(
        'Google token exchange failed'
      )
    })
  })
})
