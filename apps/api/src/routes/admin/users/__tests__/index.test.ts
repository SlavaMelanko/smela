import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { User } from '@/data'

import { createTestApp, ModuleMocker, testUuids, withClaims } from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role, UserStatus } from '@/types'

import { adminUsersRoute } from '../index'

describe('admin /users', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const USERS_URL = '/api/v1/admin/users'
  const DEFAULT_LIMIT = 25

  let app: Hono

  let mockUsers: User[]
  let mockSearchUsers: any

  beforeEach(async () => {
    mockUsers = [
      {
        id: testUuids.USER_1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: Role.User,
        status: UserStatus.Active,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: testUuids.USER_2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: Role.User,
        status: UserStatus.Verified,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
      }
    ]

    mockSearchUsers = mock(async () => ({
      data: { users: mockUsers },
      pagination: {
        page: 1,
        limit: DEFAULT_LIMIT,
        total: 2,
        totalPages: 1
      }
    }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      searchUsers: mockSearchUsers
    }))

    app = createTestApp('/api/v1/admin', adminUsersRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions: [Permission.ViewUsers]
      })
    ])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /users', () => {
    it('should return paginated users list with default parameters', async () => {
      const res = await app.request(USERS_URL, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.OK)

      const data = await res.json()
      expect(data).toEqual({
        users: [
          {
            id: testUuids.USER_1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: Role.User,
            status: UserStatus.Active,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          {
            id: testUuids.USER_2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            role: Role.User,
            status: UserStatus.Verified,
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: DEFAULT_LIMIT,
          total: 2,
          totalPages: 1
        }
      })
    })

    it('should reject invalid page parameter', async () => {
      const res = await app.request(`${USERS_URL}?page=0`, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockSearchUsers).not.toHaveBeenCalled()

      const data = await res.json()
      expect(data.error).toContain('page')
    })

    it('should reject limit exceeding maximum', async () => {
      const res = await app.request(`${USERS_URL}?limit=101`, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockSearchUsers).not.toHaveBeenCalled()

      const data = await res.json()
      expect(data.error).toContain('limit')
    })

    it('should reject invalid statuses value', async () => {
      const res = await app.request(`${USERS_URL}?statuses=invalid`, {
        method: 'GET'
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
    })

    it('should reject invalid roles value', async () => {
      const res = await app.request(`${USERS_URL}?roles=invalid`, {
        method: 'GET'
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = createTestApp('/api/v1/admin', adminUsersRoute, [
        withClaims({ role: Role.Admin, permissions: [] })
      ])

      const res = await noPermissionApp.request(USERS_URL, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockSearchUsers).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockSearchUsers.mockImplementation(async () => {
        throw new Error('Database unavailable')
      })

      const res = await app.request(USERS_URL, { method: 'GET' })

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })

    it('should pass search parameter to use case', async () => {
      const res = await app.request(`${USERS_URL}?search=john`, {
        method: 'GET'
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockSearchUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john' }),
        expect.any(Object)
      )
    })

    it('should pass search combined with filters', async () => {
      const res = await app.request(
        `${USERS_URL}?search=test&roles=${Role.User}&statuses=${UserStatus.Active}`,
        { method: 'GET' }
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockSearchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
          roles: [Role.User],
          statuses: [UserStatus.Active]
        }),
        expect.any(Object)
      )
    })

    it('should pass search combined with pagination', async () => {
      const res = await app.request(
        `${USERS_URL}?search=jane&page=2&limit=10`,
        { method: 'GET' }
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockSearchUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'jane' }),
        { page: 2, limit: 10 }
      )
    })

    it('should trim whitespace from search parameter', async () => {
      const res = await app.request(`${USERS_URL}?search=  john  `, {
        method: 'GET'
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockSearchUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john' }),
        expect.any(Object)
      )
    })
  })
})
