import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { User } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  patch,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role, UserStatus } from '@/types'

import { adminUsersRoute } from '../..'

describe('admin /users/:id', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const USER_URL = `/api/v1/admin/users/${testUuids.USER_1}`

  let app: Hono

  let mockUser: User
  let mockGetUser: any
  let mockUpdateUser: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/admin', adminUsersRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions
      })
    ])

  beforeEach(async () => {
    mockUser = {
      id: testUuids.USER_1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: Role.User,
      status: UserStatus.Active,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockGetUser = mock(async () => ({ user: mockUser }))
    mockUpdateUser = mock(async () => ({ user: mockUser }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getUser: mockGetUser,
      updateUser: mockUpdateUser
    }))

    app = buildApp([Permission.ViewUsers, Permission.ManageUsers])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /users/:id', () => {
    it('should return user with OK status', async () => {
      const res = await get(app, USER_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetUser).toHaveBeenCalledWith(testUuids.USER_1)

      const data = await res.json()
      expect(data.user).toMatchObject({
        id: testUuids.USER_1,
        email: 'john@example.com'
      })
    })

    it('should reject invalid user id', async () => {
      const res = await get(app, '/api/v1/admin/users/not-a-uuid')

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetUser).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, USER_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetUser).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetUser.mockImplementation(async () => {
        throw new Error('User not found')
      })

      const res = await get(app, USER_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /users/:id', () => {
    const body = { firstName: 'Jane', status: UserStatus.Active }

    it('should update user and return OK status', async () => {
      const res = await patch(app, USER_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateUser).toHaveBeenCalledWith(testUuids.USER_1, body)

      const data = await res.json()
      expect(data.user).toMatchObject({ id: testUuids.USER_1 })
    })

    it('should reject invalid user id', async () => {
      const res = await patch(app, '/api/v1/admin/users/not-a-uuid', body)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, USER_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewUsers])

      const res = await patch(viewOnlyApp, USER_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateUser).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateUser.mockImplementation(async () => {
        throw new Error('User not found')
      })

      const res = await patch(app, USER_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
