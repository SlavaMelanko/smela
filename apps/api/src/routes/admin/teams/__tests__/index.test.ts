import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team } from '@/data'

import {
  createTestApp,
  get,
  ModuleMocker,
  post,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { adminTeamsRoute } from '../index'

describe('admin /teams', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const TEAMS_URL = '/api/v1/admin/teams'
  const DEFAULT_LIMIT = 25

  let app: Hono

  let mockTeam: Team
  let mockGetTeams: any
  let mockCreateTeam: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/admin', adminTeamsRoute, [
      withClaims({
        id: testUuids.ADMIN_1,
        role: Role.Admin,
        permissions
      })
    ])

  beforeEach(async () => {
    mockTeam = {
      id: testUuids.TEAM_1,
      name: 'Acme Corp',
      website: 'https://acme.com',
      description: 'A test team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockGetTeams = mock(async () => ({
      teams: [mockTeam],
      pagination: { page: 1, limit: DEFAULT_LIMIT, total: 1, totalPages: 1 }
    }))
    mockCreateTeam = mock(async () => ({ team: mockTeam }))

    await moduleMocker.mock('@/use-cases/admin', () => ({
      getTeams: mockGetTeams,
      createTeam: mockCreateTeam
    }))

    app = buildApp([Permission.ViewTeams, Permission.ManageTeams])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams', () => {
    it('should return teams with pagination and OK status', async () => {
      const res = await get(app, TEAMS_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetTeams).toHaveBeenCalledWith(
        { search: undefined },
        { page: 1, limit: DEFAULT_LIMIT }
      )

      const data = await res.json()
      expect(data.teams).toHaveLength(1)
      expect(data.teams[0]).toMatchObject({
        id: testUuids.TEAM_1,
        name: 'Acme Corp'
      })
      expect(data.pagination).toEqual({
        page: 1,
        limit: DEFAULT_LIMIT,
        total: 1,
        totalPages: 1
      })
    })

    it('should pass search parameter to use case', async () => {
      const res = await get(app, `${TEAMS_URL}?search=acme`)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockGetTeams).toHaveBeenCalledWith(
        { search: 'acme' },
        expect.any(Object)
      )
    })

    it('should reject invalid page parameter', async () => {
      const res = await get(app, `${TEAMS_URL}?page=0`)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockGetTeams).not.toHaveBeenCalled()

      const data = await res.json()
      expect(data.error).toContain('page')
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, TEAMS_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockGetTeams).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockGetTeams.mockImplementation(async () => {
        throw new Error('Database unavailable')
      })

      const res = await get(app, TEAMS_URL)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('POST /teams', () => {
    const body = {
      name: 'New Team',
      website: 'https://newteam.com',
      description: 'A new team'
    }

    it('should create team and return CREATED status', async () => {
      const res = await post(app, TEAMS_URL, body)

      expect(res.status).toBe(HttpStatus.CREATED)
      expect(mockCreateTeam).toHaveBeenCalledWith(body)

      const data = await res.json()
      expect(data.team).toMatchObject({ id: testUuids.TEAM_1 })
    })

    it('should reject invalid website', async () => {
      const res = await post(app, TEAMS_URL, { ...body, website: 'not-a-url' })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockCreateTeam).not.toHaveBeenCalled()
    })

    it('should reject unknown body fields', async () => {
      const res = await post(app, TEAMS_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockCreateTeam).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await post(viewOnlyApp, TEAMS_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockCreateTeam).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockCreateTeam.mockImplementation(async () => {
        throw new Error('Team with this name already exists')
      })

      const res = await post(app, TEAMS_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
