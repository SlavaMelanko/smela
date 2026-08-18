import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { User } from '@/data'

import {
  createTestApp,
  ModuleMocker,
  patch,
  testUuids,
  withClaims
} from '@/__tests__'
import env from '@/env'
import { AppError, ErrorCode } from '@/errors'
import { HttpStatus } from '@/net/http'
import { Role, UserStatus } from '@/types'

import { meRoute } from '../index'

describe('user /me', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const ME_URL = '/api/v1/user/me'
  const PASSWORD_URL = '/api/v1/user/me/password'

  let app: Hono

  let mockFullUser: User
  let mockUpdatedUser: User
  let mockGetUser: any
  let mockUpdateUser: any
  let mockChangePassword: any

  beforeEach(async () => {
    mockFullUser = {
      id: testUuids.USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      role: Role.User,
      status: UserStatus.Active,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
    mockUpdatedUser = {
      ...mockFullUser,
      firstName: 'Jane',
      lastName: 'Smith',
      updatedAt: new Date('2024-01-02')
    }

    mockGetUser = mock(async () => ({ user: mockFullUser }))
    mockUpdateUser = mock(async () => ({ user: mockUpdatedUser }))
    mockChangePassword = mock(async () => ({ success: true }))

    await moduleMocker.mock('@/use-cases/user/me', () => ({
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
      changePassword: mockChangePassword
    }))

    app = createTestApp('/api/v1/user', meRoute, [
      withClaims({ id: testUuids.USER_1, email: 'test@example.com' })
    ])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /me', () => {
    it('should return user data without tokenVersion', async () => {
      const res = await app.request(ME_URL, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetUser).toHaveBeenCalledWith(testUuids.USER_1)

      const data = await res.json()
      expect(data).toEqual({
        user: {
          id: testUuids.USER_1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          role: Role.User,
          status: UserStatus.Active,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      })
      expect(data.user).not.toHaveProperty('tokenVersion')
    })

    it('should handle user not found as data inconsistency', async () => {
      mockGetUser.mockImplementation(async () => {
        throw new AppError(ErrorCode.InternalError, 'Internal server error.')
      })

      const res = await app.request(ME_URL, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect((await res.json()).error).toBe('Internal server error.')
    })
  })

  describe('PATCH /me', () => {
    it('should update user profile successfully', async () => {
      const res = await patch(app, ME_URL, {
        firstName: 'Jane',
        lastName: 'Smith'
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateUser).toHaveBeenCalledWith(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: 'Smith'
      })

      const data = await res.json()
      expect(data.user.firstName).toBe('Jane')
      expect(data.user.lastName).toBe('Smith')
      expect(data.user).not.toHaveProperty('tokenVersion')
    })

    it('should reject empty strings', async () => {
      const res = await patch(app, ME_URL, { firstName: '', lastName: '' })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('should trim strings and reject whitespace-only values', async () => {
      const res = await patch(app, ME_URL, {
        firstName: '   ',
        lastName: 'Smith'
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('should trim valid strings at validation layer', async () => {
      const res = await patch(app, ME_URL, {
        firstName: '  Jane  ',
        lastName: '  Smith  '
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateUser).toHaveBeenCalledWith(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: 'Smith'
      })
    })

    it('should normalize null lastName to empty string', async () => {
      const res = await patch(app, ME_URL, {
        firstName: 'Jane',
        lastName: null
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateUser).toHaveBeenCalledWith(testUuids.USER_1, {
        firstName: 'Jane',
        lastName: ''
      })
    })

    it('should handle update failure', async () => {
      mockUpdateUser.mockImplementation(async () => {
        throw new AppError(ErrorCode.InternalError, 'Failed to update user.')
      })

      const res = await patch(app, ME_URL, {
        firstName: 'Jane',
        lastName: 'Smith'
      })

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      expect((await res.json()).error).toBe('Failed to update user.')
    })
  })

  describe('PATCH /me/password', () => {
    const body = { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' }

    it('should change password with refresh token from cookie', async () => {
      const res = await patch(app, PASSWORD_URL, body, {
        'Content-Type': 'application/json',
        Cookie: `${env.COOKIE_REFRESH_TOKEN_NAME}=raw-refresh-token`
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockChangePassword).toHaveBeenCalledWith(
        testUuids.USER_1,
        'OldPass1!',
        'NewPass1!',
        'raw-refresh-token'
      )

      const data = await res.json()
      expect(data).toEqual({ success: true })
    })

    it('should pass undefined refresh token when cookie is missing', async () => {
      const res = await patch(app, PASSWORD_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockChangePassword).toHaveBeenCalledWith(
        testUuids.USER_1,
        'OldPass1!',
        'NewPass1!',
        undefined
      )
    })

    it('should reject weak new password', async () => {
      const res = await patch(app, PASSWORD_URL, {
        currentPassword: 'OldPass1!',
        newPassword: 'weak'
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockChangePassword).not.toHaveBeenCalled()
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, PASSWORD_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockChangePassword).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockChangePassword.mockImplementation(async () => {
        throw new Error('Password change failed')
      })

      const res = await patch(app, PASSWORD_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
