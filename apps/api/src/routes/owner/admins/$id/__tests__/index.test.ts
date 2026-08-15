import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { User } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  patch,
  post,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role, UserStatus } from '@/types'

import { ownerAdminsRoute } from '../..'

describe('owner /admins/:adminId', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const ADMIN_URL = `/api/v1/owner/admins/${testUuids.ADMIN_1}`
  const INVALID_ID_URL = '/api/v1/owner/admins/not-a-uuid'

  let app: Hono

  let mockAdmin: User
  let mockGetAdmin: any
  let mockUpdateAdmin: any
  let mockResendAdminInvite: any
  let mockCancelAdminInvite: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/owner', ownerAdminsRoute, [
      withClaims({
        id: testUuids.OWNER_1,
        role: Role.Owner,
        permissions
      })
    ])

  beforeEach(async () => {
    mockAdmin = {
      id: testUuids.ADMIN_1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: Role.Admin,
      status: UserStatus.Active,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockGetAdmin = mock(async () => ({ admin: mockAdmin }))
    mockUpdateAdmin = mock(async () => ({ admin: mockAdmin }))
    mockResendAdminInvite = mock(async () => ({ success: true }))
    mockCancelAdminInvite = mock(async () => ({ success: true }))

    await moduleMocker.mock('@/use-cases/owner', () => ({
      getAdmin: mockGetAdmin,
      updateAdmin: mockUpdateAdmin,
      resendAdminInvite: mockResendAdminInvite,
      cancelAdminInvite: mockCancelAdminInvite
    }))

    app = buildApp([Permission.ViewAdmins, Permission.ManageAdmins])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /admins/:adminId', () => {
    it('should return admin with OK status', async () => {
      const res = await get(app, ADMIN_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetAdmin).toHaveBeenCalledWith(testUuids.ADMIN_1)

      const data = await res.json()
      expect(data.admin).toMatchObject({
        id: testUuids.ADMIN_1,
        email: 'admin@example.com'
      })
    })

    it('should reject invalid admin id', async () => {
      const res = await get(app, INVALID_ID_URL)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetAdmin).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, ADMIN_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetAdmin).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetAdmin.mockImplementation(async () => {
        throw new Error('Admin not found')
      })

      const res = await get(app, ADMIN_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /admins/:adminId', () => {
    const body = { firstName: 'Updated', lastName: 'Name' }

    it('should update admin and return OK status', async () => {
      const res = await patch(app, ADMIN_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateAdmin).toHaveBeenCalledWith(testUuids.ADMIN_1, body)

      const data = await res.json()
      expect(data.admin).toMatchObject({ id: testUuids.ADMIN_1 })
    })

    it('should reject invalid admin id', async () => {
      const res = await patch(app, INVALID_ID_URL, body)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateAdmin).not.toHaveBeenCalled()
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, ADMIN_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateAdmin).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewAdmins])

      const res = await patch(viewOnlyApp, ADMIN_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateAdmin).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateAdmin.mockImplementation(async () => {
        throw new Error('Admin not found')
      })

      const res = await patch(app, ADMIN_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('POST /admins/:adminId/resend-invite', () => {
    const RESEND_URL = `${ADMIN_URL}/resend-invite`

    it('should resend invite and return OK status', async () => {
      const res = await post(app, RESEND_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockResendAdminInvite).toHaveBeenCalledWith(
        testUuids.ADMIN_1,
        testUuids.OWNER_1
      )

      const data = await res.json()
      expect(data).toEqual({ success: true })
    })

    it('should reject invalid admin id', async () => {
      const res = await post(app, `${INVALID_ID_URL}/resend-invite`)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockResendAdminInvite).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewAdmins])

      const res = await post(viewOnlyApp, RESEND_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockResendAdminInvite).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockResendAdminInvite.mockImplementation(async () => {
        throw new Error('Invite already accepted')
      })

      const res = await post(app, RESEND_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('POST /admins/:adminId/cancel-invite', () => {
    const CANCEL_URL = `${ADMIN_URL}/cancel-invite`

    it('should cancel invite and return OK status', async () => {
      const res = await post(app, CANCEL_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockCancelAdminInvite).toHaveBeenCalledWith(testUuids.ADMIN_1)

      const data = await res.json()
      expect(data).toEqual({ success: true })
    })

    it('should reject invalid admin id', async () => {
      const res = await post(app, `${INVALID_ID_URL}/cancel-invite`)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockCancelAdminInvite).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewAdmins])

      const res = await post(viewOnlyApp, CANCEL_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockCancelAdminInvite).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockCancelAdminInvite.mockImplementation(async () => {
        throw new Error('Invite not found')
      })

      const res = await post(app, CANCEL_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
