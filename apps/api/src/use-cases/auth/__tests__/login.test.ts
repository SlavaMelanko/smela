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
  refreshTokenRepo,
  teamRepo,
  User,
  userRepo,
  UserTeamInfo
} from '@/data'

import { buildUser, ModuleMocker, testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { verifyJwt } from '@/security/jwt'
import { hashPassword } from '@/security/password'
import { hashToken } from '@/security/token'
import { AuthProvider, Role, UserStatus } from '@/types'

import type { LoginInput } from '../login'

import { logInWithEmail } from '../login'

describe('logInWithEmail', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PASSWORD = 'ValidPass123!'
  let passwordHash: string

  let mockLoginParams: LoginInput
  let mockDeviceInfo: { ipAddress: string; userAgent: string }

  let mockUser: User
  let mockUserRepo: any
  let mockAuthRecord: AuthRecord
  let mockAuthRepo: any
  let mockRefreshTokenRepo: any
  let mockTeamRepo: any
  let mockTeam: UserTeamInfo | undefined

  let mockResolvePermissions: any

  beforeAll(async () => {
    passwordHash = await hashPassword(PASSWORD)
  })

  beforeEach(async () => {
    mockLoginParams = {
      email: 'test@example.com',
      password: PASSWORD
    }
    mockDeviceInfo = {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Test)'
    }

    mockUser = buildUser({ email: 'test@example.com' })
    mockUserRepo = {
      findByEmail: mock(async () => mockUser)
    } satisfies Partial<typeof userRepo>
    mockAuthRecord = {
      userId: testUuids.USER_1,
      provider: AuthProvider.Local,
      identifier: 'test@example.com',
      passwordHash,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
    mockAuthRepo = {
      findById: mock(async () => mockAuthRecord)
    } satisfies Partial<typeof authRepo>
    mockRefreshTokenRepo = {
      create: mock(async () => 1)
    } satisfies Partial<typeof refreshTokenRepo>
    mockTeam = undefined
    mockTeamRepo = {
      findUserTeam: mock(async () => mockTeam)
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      userRepo: mockUserRepo,
      authRepo: mockAuthRepo,
      refreshTokenRepo: mockRefreshTokenRepo,
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

  it('returns user, team, permissions, and token for valid credentials', async () => {
    const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)

    expect(result.data.team).toBeUndefined()
    expect(result.data.permissions).toBeUndefined()
    expect(result.data.user).not.toHaveProperty('tokenVersion')
    expect(result.data.user.email).toBe(mockLoginParams.email)
  })

  it('signs an access token with user claims', async () => {
    const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)

    expect(verifyJwt(result.data.accessToken)).resolves.toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      status: mockUser.status
    })
  })

  it('stores only the hash of the returned refresh token', async () => {
    const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)

    expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.id,
        tokenHash: await hashToken(result.refreshToken),
        ipAddress: mockDeviceInfo.ipAddress,
        userAgent: mockDeviceInfo.userAgent
      }),
      undefined
    )
  })

  it('returns team info when user belongs to a team', async () => {
    mockTeam = {
      id: 'team-123',
      name: 'Acme Corp',
      position: 'Software Engineer'
    }
    mockTeamRepo.findUserTeam.mockImplementation(async () => mockTeam)

    const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)

    expect(result.data.team).toEqual(mockTeam)
    expect(mockTeamRepo.findUserTeam).toHaveBeenCalledWith(mockUser.id)
  })

  it('returns admin role for admin user', async () => {
    const adminUser = { ...mockUser, role: Role.Admin }

    mockUserRepo.findByEmail.mockImplementation(async () => adminUser)

    const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)
    expect(result.data.user.role).toBe(Role.Admin)
  })

  it('throws InvalidCredentials when user does not exist', async () => {
    mockUserRepo.findByEmail.mockImplementation(async () => null)

    expect(
      logInWithEmail(mockLoginParams, mockDeviceInfo)
    ).rejects.toMatchObject({
      name: 'AppError',
      code: ErrorCode.InvalidCredentials
    })
  })

  it('logs in with uppercase email', async () => {
    const upperCaseEmail = mockLoginParams.email.toUpperCase()

    // Should still work with different case
    const result = await logInWithEmail(
      { ...mockLoginParams, email: upperCaseEmail },
      mockDeviceInfo
    )
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('refreshToken')
  })

  it('throws InvalidCredentials when auth record is not found', async () => {
    mockAuthRepo.findById.mockImplementation(async () => null)

    expect(
      logInWithEmail(mockLoginParams, mockDeviceInfo)
    ).rejects.toMatchObject({
      name: 'AppError',
      code: ErrorCode.InvalidCredentials
    })
  })

  it('throws SocialAuthOnly when auth record has no password hash', async () => {
    mockAuthRepo.findById.mockImplementation(async () => ({
      ...mockAuthRecord,
      passwordHash: null
    }))

    expect(
      logInWithEmail(mockLoginParams, mockDeviceInfo)
    ).rejects.toMatchObject({
      name: 'AppError',
      code: ErrorCode.SocialAuthOnly
    })
  })

  it('throws InvalidCredentials for incorrect password', async () => {
    expect(
      logInWithEmail(
        { ...mockLoginParams, password: 'WrongPass123!' },
        mockDeviceInfo
      )
    ).rejects.toMatchObject({
      name: 'AppError',
      code: ErrorCode.InvalidCredentials
    })
  })

  it('throws InvalidCredentials for empty password', async () => {
    expect(
      logInWithEmail({ ...mockLoginParams, password: '' }, mockDeviceInfo)
    ).rejects.toMatchObject({
      name: 'AppError',
      code: ErrorCode.InvalidCredentials
    })
  })

  describe('when password is unusual', () => {
    const passwords = [
      { name: 'very long passwords', password: 'a'.repeat(72) },
      {
        name: 'special characters in password',
        password: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      },
      { name: 'Unicode characters in password', password: '密码123é🔑' }
    ]

    passwords.forEach(({ name, password }) => {
      it(`logs in with ${name}`, async () => {
        mockAuthRecord.passwordHash = await hashPassword(password)

        const result = await logInWithEmail(
          { ...mockLoginParams, password },
          mockDeviceInfo
        )
        expect(result.data.user.id).toBe(mockUser.id)
      })
    })
  })

  it('propagates user repository failure', async () => {
    mockUserRepo.findByEmail.mockImplementation(async () => {
      throw new Error('Database connection failed')
    })

    const error = await logInWithEmail(mockLoginParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Database connection failed' })
  })

  it('propagates auth repository failure', async () => {
    mockAuthRepo.findById.mockImplementation(async () => {
      throw new Error('Auth table query failed')
    })

    const error = await logInWithEmail(mockLoginParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({ message: 'Auth table query failed' })
  })

  it('throws SocialAuthOnly when auth record has undefined password hash', async () => {
    mockAuthRepo.findById.mockImplementation(async () => ({
      ...mockAuthRecord,
      passwordHash: undefined
    }))

    const error = await logInWithEmail(mockLoginParams, mockDeviceInfo).catch(
      (error: unknown) => error
    )

    expect(error).toMatchObject({
      name: 'AppError',
      code: ErrorCode.SocialAuthOnly
    })
  })

  it('removes sensitive fields from returned user', async () => {
    const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)

    expect(result.data.user).not.toHaveProperty('tokenVersion')
    expect(result.data.user).toHaveProperty('id')
    expect(result.data.user).toHaveProperty('email')
    expect(result.data.user).toHaveProperty('firstName')
    expect(result.data.user).toHaveProperty('lastName')
    expect(result.data.user).toHaveProperty('role')
    expect(result.data.user).toHaveProperty('status')
  })

  it('returns user with each role', async () => {
    const roles = [Role.User, Role.Admin, Role.Owner]

    for (const role of roles) {
      const userWithRole = { ...mockUser, role }
      mockUserRepo.findByEmail.mockImplementation(async () => userWithRole)

      const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)
      expect(result.data.user.role).toBe(role)
    }
  })

  it('returns user with each status', async () => {
    const statuses = [UserStatus.New, UserStatus.Verified, UserStatus.Suspended]

    for (const status of statuses) {
      const userWithStatus = { ...mockUser, status }
      mockUserRepo.findByEmail.mockImplementation(async () => userWithStatus)

      const result = await logInWithEmail(mockLoginParams, mockDeviceInfo)
      expect(result.data.user.status).toBe(status)
    }
  })
})
