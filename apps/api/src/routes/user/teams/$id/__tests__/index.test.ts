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

import { teamsRoute } from '../..'

describe('user /teams/:teamId', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const TEAM_URL = `/api/v1/user/verified/teams/${TEST_TEAM_ID}`

  let app: Hono

  let mockTeam: TeamWithMemberCount
  let mockTeamRepo: any

  let mockUpdateTeam: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/user/verified', teamsRoute, [
      withClaims({
        id: testUuids.USER_1,
        role: Role.User,
        permissions
      })
    ])

  beforeEach(async () => {
    mockTeam = buildTeam({ description: 'Engineering team' })
    mockTeamRepo = createTeamAccessRepoMock(mockTeam)

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))

    mockUpdateTeam = mock(async () => ({ team: mockTeam }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      updateTeam: mockUpdateTeam
    }))

    app = buildApp([Permission.ViewTeams, Permission.ManageTeams])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams/:teamId', () => {
    it('should return team resolved by team-access middleware', async () => {
      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockTeamRepo.find).toHaveBeenCalledWith(TEST_TEAM_ID)

      const data = await res.json()
      expect(data.team).toMatchObject({
        id: TEST_TEAM_ID,
        name: 'Engineering'
      })
    })

    it('should reject invalid team id', async () => {
      const res = await get(app, '/api/v1/user/verified/teams/not-a-uuid')

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockTeamRepo.find).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, TEAM_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockTeamRepo.find).not.toHaveBeenCalled()
    })

    it('should return 404 when team does not exist', async () => {
      mockTeamRepo.find.mockImplementation(async () => undefined)

      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })

    it('should return 403 when user is not a team member', async () => {
      mockTeamRepo.findMember.mockImplementation(async () => undefined)

      const res = await get(app, TEAM_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })
  })

  describe('PATCH /teams/:teamId', () => {
    const body = { name: 'Platform', description: 'Platform team' }

    it('should update team and return OK status', async () => {
      const res = await patch(app, TEAM_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateTeam).toHaveBeenCalledWith(TEST_TEAM_ID, body)

      const data = await res.json()
      expect(data.team).toMatchObject({ id: TEST_TEAM_ID })
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, TEAM_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateTeam).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await patch(viewOnlyApp, TEAM_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateTeam).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateTeam.mockImplementation(async () => {
        throw new Error('Database error')
      })

      const res = await patch(app, TEAM_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
