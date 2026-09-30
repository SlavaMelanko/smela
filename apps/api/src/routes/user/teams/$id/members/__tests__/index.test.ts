import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { TeamWithMemberCount } from '@/data'

import {
  buildTeam,
  createTeamAccessRepoMock,
  createTestApp,
  get,
  ModuleMocker,
  post,
  TEST_TEAM_ID,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { getMemberDefaultPermissions, Permission, Role } from '@/types'

import { teamsRoute } from '../../..'

describe('user /teams/:teamId/members', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const MEMBERS_URL = `/api/v1/user/verified/teams/${TEST_TEAM_ID}/members`

  let app: Hono

  let mockTeam: TeamWithMemberCount
  let mockTeamRepo: any

  let mockMembers: any[]
  let mockGetTeamMembers: any
  let mockInviteMember: any

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

    mockMembers = [{ id: testUuids.USER_1, firstName: 'Alice' }]
    mockGetTeamMembers = mock(async () => ({ members: mockMembers }))
    mockInviteMember = mock(async () => ({
      member: { id: testUuids.USER_2, firstName: 'Bob' }
    }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      getTeamMembers: mockGetTeamMembers,
      inviteMember: mockInviteMember
    }))

    app = buildApp([Permission.ViewTeams, Permission.ManageTeams])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams/:teamId/members', () => {
    it('returns team members with OK status', async () => {
      const res = await get(app, MEMBERS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetTeamMembers).toHaveBeenCalledWith(TEST_TEAM_ID)

      const data = await res.json()
      expect(data.members).toEqual(mockMembers)
    })

    it('rejects invalid team id', async () => {
      const res = await get(
        app,
        '/api/v1/user/verified/teams/not-a-uuid/members'
      )

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetTeamMembers).not.toHaveBeenCalled()
    })

    it('returns 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, MEMBERS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetTeamMembers).not.toHaveBeenCalled()
    })

    it('returns error status when use case throws', async () => {
      mockGetTeamMembers.mockImplementation(async () => {
        throw new Error('Team not found')
      })

      const res = await get(app, MEMBERS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('POST /teams/:teamId/members', () => {
    const body = {
      firstName: 'Bob',
      email: 'bob@example.com',
      permissions: { teams: { view: true } }
    }

    it('invites member and return CREATED status', async () => {
      const res = await post(app, MEMBERS_URL, body)

      expect(res.status).toBe(HttpStatus.CREATED)
      expect(mockInviteMember).toHaveBeenCalledWith(
        mockTeam,
        expect.objectContaining({
          firstName: 'Bob',
          email: 'bob@example.com'
        }),
        testUuids.USER_1
      )

      const data = await res.json()
      expect(data.member).toMatchObject({ id: testUuids.USER_2 })
    })

    it('rejects invalid email', async () => {
      const res = await post(app, MEMBERS_URL, { ...body, email: 'invalid' })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockInviteMember).not.toHaveBeenCalled()
    })

    it('returns 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await post(viewOnlyApp, MEMBERS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockInviteMember).not.toHaveBeenCalled()
    })

    it('returns error status when use case throws', async () => {
      mockInviteMember.mockImplementation(async () => {
        throw new Error('Email already a member')
      })

      const res = await post(app, MEMBERS_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('GET /teams/:teamId/members/default-permissions', () => {
    it('returns default member permissions with OK status', async () => {
      const res = await get(app, `${MEMBERS_URL}/default-permissions`)

      expect(res.status).toBe(HttpStatus.OK)

      const data = await res.json()
      expect(data.permissions).toEqual(getMemberDefaultPermissions())
    })

    it('returns 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(
        noPermissionApp,
        `${MEMBERS_URL}/default-permissions`
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })
  })
})
