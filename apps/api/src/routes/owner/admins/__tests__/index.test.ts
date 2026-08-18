import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { User } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  post,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Resource, Role, UserStatus } from '@/types'

import { ownerAdminsRoute } from '../index'

describe('owner /admins', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const ADMINS_URL = '/api/v1/owner/admins'
  const DEFAULT_LIMIT = 25

  let app: Hono

  let mockAdmins: User[]
  let mockGetAdmins: any
  let mockInviteAdmin: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/owner', ownerAdminsRoute, [
      withClaims({
        id: testUuids.OWNER_1,
        role: Role.Owner,
        permissions
      })
    ])

  beforeEach(async () => {
    mockAdmins = [
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
    ]

    mockGetAdmins = mock(async () => ({
      data: { users: mockAdmins },
      pagination: { page: 1, limit: DEFAULT_LIMIT, total: 1, totalPages: 1 }
    }))
    mockInviteAdmin = mock(async (body: any) => ({
      admin: { id: testUuids.ADMIN_1, ...body }
    }))

    await moduleMocker.mock('@/use-cases/owner', () => ({
      getAdmins: mockGetAdmins,
      inviteAdmin: mockInviteAdmin
    }))

    app = buildApp([Permission.ViewAdmins, Permission.ManageAdmins])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /admins', () => {
    it('should return paginated admins list with default parameters', async () => {
      const res = await get(app, ADMINS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetAdmins).toHaveBeenCalledWith(
        { search: undefined, roles: [], statuses: undefined },
        { page: 1, limit: DEFAULT_LIMIT }
      )

      const data = await res.json()
      expect(data.users).toHaveLength(1)
      expect(data.users[0]).toMatchObject({
        id: testUuids.ADMIN_1,
        email: 'admin@example.com'
      })
      expect(data.pagination).toEqual({
        page: 1,
        limit: DEFAULT_LIMIT,
        total: 1,
        totalPages: 1
      })
    })

    it('should pass search and filters to use case', async () => {
      const res = await get(
        app,
        `${ADMINS_URL}?search=admin&statuses=${UserStatus.Active}&page=2&limit=10`
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetAdmins).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'admin',
          statuses: [UserStatus.Active]
        }),
        { page: 2, limit: 10 }
      )
    })

    it('should reject invalid page parameter', async () => {
      const res = await get(app, `${ADMINS_URL}?page=0`)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetAdmins).not.toHaveBeenCalled()
    })

    it('should reject invalid statuses value', async () => {
      const res = await get(app, `${ADMINS_URL}?statuses=invalid`)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetAdmins).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, ADMINS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetAdmins).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetAdmins.mockImplementation(async () => {
        throw new Error('Database unavailable')
      })

      const res = await get(app, ADMINS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('POST /admins', () => {
    const body = {
      firstName: 'New',
      lastName: 'Admin',
      email: 'newadmin@example.com',
      permissions: { [Resource.Users]: { view: true, manage: true } }
    }

    it('should invite admin and return CREATED status', async () => {
      const res = await post(app, ADMINS_URL, body)

      expect(res.status).toBe(HttpStatus.CREATED)
      expect(mockInviteAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'New',
          email: 'newadmin@example.com'
        }),
        testUuids.OWNER_1
      )

      const data = await res.json()
      expect(data.admin).toMatchObject({
        id: testUuids.ADMIN_1,
        email: 'newadmin@example.com'
      })
    })

    it('should reject unknown body fields', async () => {
      const res = await post(app, ADMINS_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockInviteAdmin).not.toHaveBeenCalled()
    })

    it('should reject missing email', async () => {
      const { email: _email, ...withoutEmail } = body

      const res = await post(app, ADMINS_URL, withoutEmail)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockInviteAdmin).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewAdmins])

      const res = await post(viewOnlyApp, ADMINS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockInviteAdmin).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockInviteAdmin.mockImplementation(async () => {
        throw new Error('Email already in use')
      })

      const res = await post(app, ADMINS_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('GET /admins/default-permissions', () => {
    it('should return default admin permissions with OK status', async () => {
      const res = await get(app, `${ADMINS_URL}/default-permissions`)

      expect(res.status).toBe(HttpStatus.OK)

      const data = await res.json()
      expect(data).toEqual({
        permissions: {
          [Resource.Dashboard]: { view: true, manage: true },
          [Resource.Users]: { view: true, manage: true },
          [Resource.Teams]: { view: true, manage: true },
          [Resource.System]: { view: false, manage: false }
        }
      })
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(
        noPermissionApp,
        `${ADMINS_URL}/default-permissions`
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })
  })
})
