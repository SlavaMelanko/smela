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
  post,
  TEST_TEAM_ID,
  testUuids,
  withClaims
} from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { teamsRoute } from '../..'

describe('user /teams/:teamId', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const TEAM_URL = `/api/v1/user/verified/teams/${TEST_TEAM_ID}`

  let app: Hono

  let mockTeam: TeamWithMemberCount
  let mockTeamRepo: any
  let mockTeamPermissions: any

  let mockUpdateTeam: any
  let mockSwitchTeam: any
  let mockAcceptTeamInvite: ReturnType<typeof mock>
  let mockDeclineTeamInvite: ReturnType<typeof mock>

  // Team permissions come from the membership, not the claims
  const buildApp = () =>
    createTestApp('/api/v1/user/verified', teamsRoute, [
      withClaims({ id: testUuids.USER_1, role: Role.User, permissions: [] })
    ])

  beforeEach(async () => {
    mockTeam = buildTeam({ description: 'Engineering team' })
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

    mockUpdateTeam = mock(async () => ({ team: mockTeam }))

    mockSwitchTeam = mock(async () => ({
      team: { id: TEST_TEAM_ID, name: 'Engineering', permissions: [] },
      teams: [{ id: TEST_TEAM_ID, name: 'Engineering', position: null }]
    }))

    const userTeams = {
      team: undefined,
      teams: [],
      invites: []
    }
    mockAcceptTeamInvite = mock(async () => userTeams)
    mockDeclineTeamInvite = mock(async () => userTeams)

    await moduleMocker.mock('@/use-cases/user', () => ({
      updateTeam: mockUpdateTeam,
      switchTeam: mockSwitchTeam,
      acceptTeamInvite: mockAcceptTeamInvite,
      declineTeamInvite: mockDeclineTeamInvite
    }))

    app = buildApp()
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams/:teamId', () => {
    it('returns team resolved by team-access middleware', async () => {
      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockTeamRepo.find).toHaveBeenCalledWith(TEST_TEAM_ID)

      const data = await res.json()
      expect(data.team).toMatchObject({
        id: TEST_TEAM_ID,
        name: 'Engineering'
      })
    })

    it('rejects invalid team id', async () => {
      const res = await get(app, '/api/v1/user/verified/teams/not-a-uuid')

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockTeamRepo.find).not.toHaveBeenCalled()
    })

    it('returns 403 when membership lacks view permission', async () => {
      mockTeamPermissions.mockImplementation(async () => [])

      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('returns 404 when team does not exist', async () => {
      mockTeamRepo.find.mockImplementation(async () => undefined)

      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('returns 403 when user is not a team member', async () => {
      mockTeamRepo.findMember.mockImplementation(async () => undefined)

      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })
  })

  describe('PATCH /teams/:teamId', () => {
    const body = { name: 'Platform', description: 'Platform team' }

    it('updates team and return OK status', async () => {
      const res = await patch(app, TEAM_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateTeam).toHaveBeenCalledWith(TEST_TEAM_ID, body)

      const data = await res.json()
      expect(data.team).toMatchObject({ id: TEST_TEAM_ID })
    })

    it('rejects unknown body fields', async () => {
      const res = await patch(app, TEAM_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateTeam).not.toHaveBeenCalled()
    })

    it('returns 403 when membership lacks manage permission', async () => {
      mockTeamPermissions.mockImplementation(async () => [Permission.ViewTeams])

      const res = await patch(app, TEAM_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateTeam).not.toHaveBeenCalled()
    })

    it('returns error status when use case throws', async () => {
      mockUpdateTeam.mockImplementation(async () => {
        throw new Error('Database error')
      })

      const res = await patch(app, TEAM_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('POST /teams/:teamId/switch', () => {
    const SWITCH_URL = `${TEAM_URL}/switch`

    it('switches to the team and returns the active team with all teams', async () => {
      const res = await post(app, SWITCH_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockSwitchTeam).toHaveBeenCalledWith(
        testUuids.USER_1,
        TEST_TEAM_ID
      )

      const data = await res.json()
      expect(data.team).toMatchObject({ id: TEST_TEAM_ID })
      expect(data.teams).toHaveLength(1)
    })

    it('rejects invalid team id', async () => {
      const res = await post(app, '/api/v1/user/verified/teams/invalid/switch')

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockSwitchTeam).not.toHaveBeenCalled()
    })

    it('returns 403 when user is not a team member', async () => {
      mockSwitchTeam.mockImplementation(async () => {
        throw new AppError(ErrorCode.Forbidden, 'Access denied to team')
      })

      const res = await post(app, SWITCH_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })
  })

  const inviteActions = [
    { path: 'accept-invite', getUseCase: () => mockAcceptTeamInvite },
    { path: 'decline-invite', getUseCase: () => mockDeclineTeamInvite }
  ]

  inviteActions.forEach(({ path, getUseCase }) => {
    describe(`POST /teams/:teamId/${path}`, () => {
      const URL = `${TEAM_URL}/${path}`

      it("handles the caller's own invite without the team access check", async () => {
        const res = await post(app, URL)

        expect(res.status).toBe(HttpStatus.OK)
        expect(getUseCase()).toHaveBeenCalledWith(
          testUuids.USER_1,
          TEST_TEAM_ID
        )
        expect(mockTeamRepo.findMember).not.toHaveBeenCalled()
        expect(await res.json()).toEqual({ teams: [], invites: [] })
      })

      it('returns 404 when there is no pending invite', async () => {
        getUseCase().mockImplementation(async () => {
          throw new AppError(ErrorCode.NotFound, 'Invite not found')
        })

        const res = await post(app, URL)

        expect(res.status).toBe(HttpStatus.NOT_FOUND)
      })
    })
  })
})
