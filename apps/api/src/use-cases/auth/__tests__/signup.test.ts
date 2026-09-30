import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type {
  authRepo,
  rbacRepo,
  refreshTokenRepo,
  tokenRepo,
  User,
  userRepo
} from '@/data'

import { createTransactionMock, ModuleMocker, testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { verifyJwt } from '@/security/jwt'
import { comparePasswordHashes } from '@/security/password'
import { hashToken, TokenType } from '@/security/token'
import {
  buildVerificationUrl,
  VerificationEmailMessageBuilder
} from '@/services/email'
import {
  Action,
  AuthProvider,
  Permission,
  Resource,
  Role,
  UserStatus
} from '@/types'

import type { SignupInput } from '../signup'

import { signUpWithEmail } from '../signup'

describe('signUpWithEmail', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockSignupParams: SignupInput
  let mockDeviceInfo: { ipAddress: string; userAgent: string }

  let mockNewUser: User
  let mockUserRepo: any
  let mockAuthRepo: any
  let mockTokenRepo: any
  let mockRefreshTokenRepo: any
  let mockRbacRepo: any
  let mockTransaction: ReturnType<typeof createTransactionMock>

  let mockEmailService: any

  beforeEach(async () => {
    mockSignupParams = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'ValidPass123!'
    }
    mockDeviceInfo = {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Test)'
    }

    mockNewUser = {
      id: testUuids.USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: UserStatus.New,
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockUserRepo = {
      findByEmail: mock(async () => undefined),
      create: mock(async () => mockNewUser)
    } satisfies Partial<typeof userRepo>
    mockAuthRepo = {
      create: mock(async () => {})
    } satisfies Partial<typeof authRepo>
    mockTokenRepo = {
      issue: mock(async () => {})
    } satisfies Partial<typeof tokenRepo>
    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    } satisfies Partial<typeof refreshTokenRepo>
    mockRbacRepo = {
      setUserPermissions: mock(async () => {}),
      findUserPermissions: mock(async () => [
        { action: Action.View, resource: Resource.Dashboard },
        { action: Action.Manage, resource: Resource.Dashboard }
      ])
    } satisfies Partial<typeof rbacRepo>
    mockTransaction = createTransactionMock()

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      authRepo: mockAuthRepo,
      tokenRepo: mockTokenRepo,
      refreshTokenRepo: mockRefreshTokenRepo,
      rbacRepo: mockRbacRepo,
      db: mockTransaction
    }))

    mockEmailService = {
      send: mock(async () => ({ provider: 'ethereal', messageId: 'test-id' }))
    }

    await moduleMocker.mock('@/services/email', () => ({
      emailService: mockEmailService
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  const getStoredPasswordHash = () =>
    mockAuthRepo.create.mock.calls[0][0].passwordHash as string

  const getIssuedVerificationToken = () =>
    mockTokenRepo.issue.mock.calls[0][1].token as string

  it('creates a new user with correct data', async () => {
    const result = await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.create).toHaveBeenCalledWith(
      {
        firstName: mockSignupParams.firstName,
        lastName: mockSignupParams.lastName,
        email: mockSignupParams.email,
        status: UserStatus.New
      },
      expect.anything()
    )
    expect(mockUserRepo.create).toHaveBeenCalledTimes(1)
    expect(result.data.user).toEqual(mockNewUser)
    expect(result.refreshToken).toEqual(expect.any(String))
    expect(result.data.accessToken).toEqual(expect.any(String))
  })

  it('creates auth record with a hash of the password', async () => {
    await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(mockAuthRepo.create).toHaveBeenCalledWith(
      {
        userId: mockNewUser.id,
        provider: AuthProvider.Local,
        identifier: mockSignupParams.email,
        passwordHash: expect.any(String)
      },
      expect.anything()
    )
    expect(mockAuthRepo.create).toHaveBeenCalledTimes(1)

    const passwordHash = getStoredPasswordHash()
    expect(passwordHash).not.toBe(mockSignupParams.password)
    expect(
      comparePasswordHashes(mockSignupParams.password, passwordHash)
    ).resolves.toBe(true)
  })

  it('creates email verification token', async () => {
    await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(mockTokenRepo.issue).toHaveBeenCalledWith(
      mockNewUser.id,
      {
        userId: mockNewUser.id,
        type: TokenType.EmailVerification,
        token: expect.any(String),
        expiresAt: expect.any(Date)
      },
      expect.anything()
    )
    expect(mockTokenRepo.issue).toHaveBeenCalledTimes(1)
  })

  it('sends email verification email with verification token', async () => {
    await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.any(VerificationEmailMessageBuilder)
    )
    expect(mockEmailService.send).toHaveBeenCalledTimes(1)
    expect(mockEmailService.send.mock.calls[0][0]).toMatchObject({
      data: {
        verificationUrl: buildVerificationUrl(getIssuedVerificationToken())
      }
    })
  })

  it('signs an access token with user claims and permissions', async () => {
    const result = await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(result.data.permissions).toEqual([
      Permission.ViewDashboard,
      Permission.ManageDashboard
    ])
    expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
      id: mockNewUser.id,
      email: mockNewUser.email,
      role: mockNewUser.role,
      status: mockNewUser.status,
      permissions: result.data.permissions
    })
  })

  it('stores only the hash of the returned refresh token', async () => {
    const result = await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
      {
        userId: mockNewUser.id,
        tokenHash: await hashToken(result.refreshToken),
        ipAddress: mockDeviceInfo.ipAddress,
        userAgent: mockDeviceInfo.userAgent,
        expiresAt: expect.any(Date)
      },
      undefined
    )
    expect(mockRefreshTokenRepo.create).toHaveBeenCalledTimes(1)
  })

  it('does not return sensitive fields in the response', async () => {
    const result = await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    // Ensure tokenVersion is not included in the response
    expect(result.data.user).not.toHaveProperty('tokenVersion')
    // createdAt and updatedAt are now included in the response
    expect(result.data.user).toHaveProperty('createdAt')
    expect(result.data.user).toHaveProperty('updatedAt')

    // Ensure expected fields are present
    expect(result.data.user).toHaveProperty('id')
    expect(result.data.user).toHaveProperty('firstName')
    expect(result.data.user).toHaveProperty('lastName')
    expect(result.data.user).toHaveProperty('email')
    expect(result.data.user).toHaveProperty('status')
    expect(result.data.user).toHaveProperty('role')
  })

  it('checks for existing user first', async () => {
    await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
      mockSignupParams.email
    )
    expect(mockUserRepo.findByEmail).toHaveBeenCalledTimes(1)
  })

  it('throws EmailAlreadyInUse when email is already in use', async () => {
    const existingUser = {
      id: testUuids.USER_2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'john@example.com',
      status: UserStatus.Verified,
      role: Role.User,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockUserRepo.findByEmail.mockImplementation(async () => existingUser)

    const error = await signUpWithEmail(mockSignupParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({
      name: 'AppError',
      code: ErrorCode.EmailAlreadyInUse
    })

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
      mockSignupParams.email
    )
    expect(mockTransaction.transaction).not.toHaveBeenCalled()
    expect(mockUserRepo.create).not.toHaveBeenCalled()
    expect(mockAuthRepo.create).not.toHaveBeenCalled()
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()

    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('throws and rolls back transaction when user creation fails', async () => {
    mockUserRepo.create.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    const error = await signUpWithEmail(mockSignupParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Database connection failed' })

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
      mockSignupParams.email
    )
    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.create).toHaveBeenCalledTimes(1)
    expect(mockAuthRepo.create).not.toHaveBeenCalled()
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()

    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('throws and rolls back transaction when auth creation fails', async () => {
    mockAuthRepo.create.mockImplementation(async () => {
      throw new Error('Auth table unavailable')
    })

    const error = await signUpWithEmail(mockSignupParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Auth table unavailable' })

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
      mockSignupParams.email
    )
    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.create).toHaveBeenCalledTimes(1)
    expect(mockAuthRepo.create).toHaveBeenCalledTimes(1)
    expect(mockTokenRepo.issue).not.toHaveBeenCalled()

    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('throws and rolls back transaction when token replacement fails', async () => {
    mockTokenRepo.issue.mockImplementation(async () => {
      throw new Error('Token replacement failed')
    })

    const error = await signUpWithEmail(mockSignupParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Token replacement failed' })

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
      mockSignupParams.email
    )
    expect(mockTransaction.transaction).toHaveBeenCalledTimes(1)
    expect(mockUserRepo.create).toHaveBeenCalledTimes(1)
    expect(mockAuthRepo.create).toHaveBeenCalledTimes(1)
    expect(mockTokenRepo.issue).toHaveBeenCalledTimes(1)

    expect(mockEmailService.send).not.toHaveBeenCalled()
  })

  it('keeps email case when creating user', async () => {
    const uppercaseEmail = mockSignupParams.email.toUpperCase()
    const paramsWithUppercaseEmail = {
      ...mockSignupParams,
      email: uppercaseEmail
    }

    const result = await signUpWithEmail(
      paramsWithUppercaseEmail,
      mockDeviceInfo
    )

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(uppercaseEmail)
    expect(mockUserRepo.create).toHaveBeenCalledWith(
      {
        firstName: mockSignupParams.firstName,
        lastName: mockSignupParams.lastName,
        email: uppercaseEmail,
        status: UserStatus.New
      },
      expect.anything()
    )
    expect(result.data.user).toEqual(mockNewUser)
  })

  it('creates user with minimal names', async () => {
    const paramsWithShortNames = {
      ...mockSignupParams,
      firstName: 'Al',
      lastName: 'Bo'
    }

    const userWithShortNames = {
      ...mockNewUser,
      firstName: 'Al',
      lastName: 'Bo'
    }
    mockUserRepo.create.mockImplementation(async () => userWithShortNames)

    await signUpWithEmail(paramsWithShortNames, mockDeviceInfo)

    expect(mockUserRepo.create).toHaveBeenCalledWith(
      {
        firstName: 'Al',
        lastName: 'Bo',
        email: mockSignupParams.email,
        status: UserStatus.New
      },
      expect.anything()
    )

    expect(mockEmailService.send).toHaveBeenCalledWith(
      expect.any(VerificationEmailMessageBuilder)
    )
  })

  it('returns user with default User role', async () => {
    const result = await signUpWithEmail(mockSignupParams, mockDeviceInfo)

    expect(result.data.user).toEqual(mockNewUser)
    expect(result.data.user.role).toBe(Role.User)
  })

  it('stores a hash of complex passwords', async () => {
    const complexPassword = 'VeryComplex@Password123!#$'
    const paramsWithComplexPassword = {
      ...mockSignupParams,
      password: complexPassword
    }

    await signUpWithEmail(paramsWithComplexPassword, mockDeviceInfo)

    expect(
      comparePasswordHashes(complexPassword, getStoredPasswordHash())
    ).resolves.toBe(true)
  })

  it('creates user with long names', async () => {
    const longFirstName = 'A'.repeat(50)
    const longLastName = 'B'.repeat(50)
    const paramsWithLongNames = {
      ...mockSignupParams,
      firstName: longFirstName,
      lastName: longLastName
    }

    await signUpWithEmail(paramsWithLongNames, mockDeviceInfo)

    expect(mockUserRepo.create).toHaveBeenCalledWith(
      {
        firstName: longFirstName,
        lastName: longLastName,
        email: mockSignupParams.email,
        status: UserStatus.New
      },
      expect.anything()
    )
  })
})
