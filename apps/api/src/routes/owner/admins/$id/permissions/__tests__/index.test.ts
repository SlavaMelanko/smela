import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  createTestApp,
  get,
  ModuleMocker,
  patch,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Resource, Role } from '@/types'

import { ownerAdminsRoute } from '../../..'

describe('owner /admins/:adminId/permissions', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PERMISSIONS_URL = `/api/v1/owner/admins/${testUuids.ADMIN_1}/permissions`
  const INVALID_ID_URL = '/api/v1/owner/admins/not-a-uuid/permissions'

  const mockPermissions = {
    [Resource.Users]: { view: true, manage: true },
    [Resource.Teams]: { view: true, manage: false }
  }

  let app: Hono

  let mockGetAdminPermissions: any
  let mockUpdateAdminPermissions: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/owner', ownerAdminsRoute, [
      withClaims({
        id: testUuids.OWNER_1,
        role: Role.Owner,
        permissions
      })
    ])

  beforeEach(async () => {
    mockGetAdminPermissions = mock(async () => ({
      permissions: mockPermissions
    }))
    mockUpdateAdminPermissions = mock(async () => ({
      permissions: mockPermissions
    }))

    await moduleMocker.mock('@/use-cases/owner', () => ({
      getAdminPermissions: mockGetAdminPermissions,
      updateAdminPermissions: mockUpdateAdminPermissions
    }))

    app = buildApp([Permission.ViewAdmins, Permission.ManageAdmins])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /admins/:adminId/permissions', () => {
    it('should return admin permissions with OK status', async () => {
      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetAdminPermissions).toHaveBeenCalledWith(testUuids.ADMIN_1)

      const data = await res.json()
      expect(data).toEqual({ permissions: mockPermissions })
    })

    it('should reject invalid admin id', async () => {
      const res = await get(app, INVALID_ID_URL)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetAdminPermissions).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetAdminPermissions).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetAdminPermissions.mockImplementation(async () => {
        throw new Error('Admin not found')
      })

      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /admins/:adminId/permissions', () => {
    const body = {
      permissions: { [Resource.Users]: { view: true, manage: false } }
    }

    it('should update permissions and return OK status', async () => {
      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateAdminPermissions).toHaveBeenCalledWith(
        testUuids.ADMIN_1,
        expect.objectContaining({
          [Resource.Users]: { view: true, manage: false }
        })
      )

      const data = await res.json()
      expect(data).toEqual({ permissions: mockPermissions })
    })

    it('should reject invalid admin id', async () => {
      const res = await patch(app, INVALID_ID_URL, body)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateAdminPermissions).not.toHaveBeenCalled()
    })

    it('should reject empty permissions map', async () => {
      const res = await patch(app, PERMISSIONS_URL, { permissions: {} })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateAdminPermissions).not.toHaveBeenCalled()
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, PERMISSIONS_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateAdminPermissions).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewAdmins])

      const res = await patch(viewOnlyApp, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateAdminPermissions).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateAdminPermissions.mockImplementation(async () => {
        throw new Error('Admin not found')
      })

      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
