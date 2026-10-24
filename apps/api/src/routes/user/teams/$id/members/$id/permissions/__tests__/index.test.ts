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
import { AppError, ErrorCode } from '@/errors'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { teamsRoute } from '../../../../..'

describe('user /teams/:teamId/members/:memberId/permissions', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const PERMISSIONS_URL = `/api/v1/user/verified/teams/${TEST_TEAM_ID}/members/${testUuids.USER_2}/permissions`

  let app: Hono

  let mockTeam: TeamWithMemberCount
  let mockTeamRepo: any
  let mockTeamPermissions: any

  let mockPermissions: any
  let mockGetTeamMemberPermissions: any
  let mockUpdateTeamMemberPermissions: any

  // Team permissions come from the membership, not the claims
  const buildApp = () =>
    createTestApp('/api/v1/user/verified', teamsRoute, [
      withClaims({ id: testUuids.USER_1, role: Role.User, permissions: [] })
    ])

  beforeEach(async () => {
    mockTeam = buildTeam()
    mockTeamRepo = createTeamAccessRepoMock(mockTeam)

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))

    mockTeamPermissions = mock(async (): Promise<Permission[]> => [
      Permission.ViewTeams,
      Permission.ManageTeams
    ])

    await moduleMocker.mock('@/use-cases/resolve-permissions', () => ({
      resolveMembershipPermissionList: mockTeamPermissions
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

    app = buildApp()
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams/:teamId/members/:memberId/permissions', () => {
    it('returns member permissions with OK status', async () => {
      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetTeamMemberPermissions).toHaveBeenCalledWith(
        testUuids.MEMBERSHIP_1
      )

      const data = await res.json()
      expect(data.permissions).toEqual(mockPermissions)
    })

    it('rejects invalid member id', async () => {
      const res = await get(
        app,
        `/api/v1/user/verified/teams/${TEST_TEAM_ID}/members/not-a-uuid/permissions`
      )

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('returns 403 when membership lacks view permission', async () => {
      mockTeamPermissions.mockImplementation(async () => [])

      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('returns error status when use case throws', async () => {
      mockGetTeamMemberPermissions.mockImplementation(async () => {
        throw new Error('Member not found')
      })

      const res = await get(app, PERMISSIONS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('PATCH /teams/:teamId/members/:memberId/permissions', () => {
    const body = { permissions: { teams: { view: true } } }

    it('updates member permissions and return OK status', async () => {
      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateTeamMemberPermissions).toHaveBeenCalledWith(
        mockTeam,
        expect.objectContaining({ id: testUuids.USER_2 }),
        Role.User,
        { teams: { view: true, manage: false } }
      )

      const data = await res.json()
      expect(data.permissions).toEqual(mockPermissions)
    })

    it('rejects empty permissions object', async () => {
      const res = await patch(app, PERMISSIONS_URL, { permissions: {} })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it.each([testUuids.USER_1, testUuids.USER_1.toUpperCase()])(
      'returns 403 when member edits own permissions using %s',
      async memberId => {
        const res = await patch(
          app,
          `/api/v1/user/verified/teams/${TEST_TEAM_ID}/members/${memberId}/permissions`,
          body
        )

        expect(res.status).toBe(HttpStatus.FORBIDDEN)
        expect(mockUpdateTeamMemberPermissions).not.toHaveBeenCalled()
      }
    )

    it('returns 403 when the use case rejects editing the creator', async () => {
      mockUpdateTeamMemberPermissions.mockImplementation(async () => {
        throw new AppError(
          ErrorCode.Forbidden,
          'Cannot edit the team creator permissions'
        )
      })

      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('returns 403 when membership lacks manage permission', async () => {
      mockTeamPermissions.mockImplementation(async () => [Permission.ViewTeams])

      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateTeamMemberPermissions).not.toHaveBeenCalled()
    })

    it('returns error status when use case throws', async () => {
      mockUpdateTeamMemberPermissions.mockImplementation(async () => {
        throw new Error('Member not found')
      })

      const res = await patch(app, PERMISSIONS_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
