import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { TeamWithMemberCount } from '@/data'

import {
  buildTeam,
  createTeamAccessRepoMock,
  createTestApp,
  get,
  ModuleMocker,
  patch,
  TEST_TEAM_ID,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { teamsRoute } from '../../../../..'

describe('user /teams/:teamId/members/:memberId/permissions', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PERMISSIONS_URL = `/api/v1/user/verified/teams/${TEST_TEAM_ID}/members/${testUuids.USER_2}/permissions`

  let app: Hono

  let mockTeam: TeamWithMemberCount
  let mockTeamRepo: any

  let mockPermissions: any
  let mockGetTeamMemberPermissions: any
  let mockUpdateTeamMemberPermissions: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/user/verified', teamsRoute, [
      withClaims({
        id: testUuids.USER_1,
        role: Role.User,
        permissions
      })
    ])

  beforeEach(async () => {
    mockTeam = buildTeam()
    mockTeamRepo = createTeamAccessRepoMock(mockTeam)

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))

    mockPermissions = {
      dashboard: { view: true },
      teams: { view: true }
    }
    mockGetTeamMemberPermissions = mock(async () => ({
      permissions: mockPermissions
    }))
    mockUpdateTeamMemberPermissions = mock(async () => ({
      permissions: mockPermissions
    }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      getTeamMemberPermissions: mockGetTeamMemberPermissions,
      updateTeamMemberPermissions: mockUpdateTeamMemberPermissions
    }))

    app = buildApp([Permission.ViewTeams, Permission.ManageTeams])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams/:teamId/members/:memberId/permissions', () => {
    it('should return member permissions with OK status', async () => {
      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetTeamMemberPermissions).toHaveBeenCalledWith(
        testUuids.USER_2
      )

      const data = await res.json()
      expect(data.permissions).toEqual(mockPermissions)
    })

    it('should reject invalid member id', async () => {
      const res = await get(
        app,
        `/api/v1/user/verified/teams/${TEST_TEAM_ID}/members/not-a-uuid/permissions`
      )

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetTeamMemberPermissions.mockImplementation(async () => {
        throw new Error('Member not found')
      })

      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /teams/:teamId/members/:memberId/permissions', () => {
    const body = { permissions: { teams: { view: true } } }

    it('should update member permissions and return OK status', async () => {
      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateTeamMemberPermissions).toHaveBeenCalledWith(
        testUuids.USER_2,
        { teams: { view: true, manage: false } }
      )

      const data = await res.json()
      expect(data.permissions).toEqual(mockPermissions)
    })

    it('should reject empty permissions object', async () => {
      const res = await patch(app, PERMISSIONS_URL, { permissions: {} })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await patch(viewOnlyApp, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateTeamMemberPermissions.mockImplementation(async () => {
        throw new Error('Member not found')
      })

      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
