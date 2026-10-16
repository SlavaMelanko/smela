import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  buildTeam,
  createTestApp,
  ModuleMocker,
  post,
  testUuids,
  withClaims
} from '@/__tests__'
import { AppError, ErrorCode } from '@/errors'
import { HttpStatus } from '@/net/http'
import { Role } from '@/types'

import { teamsRoute } from '..'

describe('user POST /teams', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const TEAMS_URL = '/api/v1/user/verified/teams'
  const body = { name: 'New Team', website: 'https://newteam.com' }

  let app: Hono
  let mockCreateTeam: any

  beforeEach(async () => {
    mockCreateTeam = mock(async () => ({ team: buildTeam() }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      createTeam: mockCreateTeam
    }))

    app = createTestApp('/api/v1/user/verified', teamsRoute, [
      withClaims({ id: testUuids.USER_1, role: Role.User, permissions: [] })
    ])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('creates team for current user without team permissions', async () => {
    const res = await post(app, TEAMS_URL, body)

    expect(res.status).toBe(HttpStatus.CREATED)
    expect(mockCreateTeam).toHaveBeenCalledWith(testUuids.USER_1, body)
  })

  it('rejects unknown body fields', async () => {
    const res = await post(app, TEAMS_URL, { ...body, hacker: true })

    expect(res.status).toBe(HttpStatus.BAD_REQUEST)
    expect(mockCreateTeam).not.toHaveBeenCalled()
  })

  it('returns 409 when user already belongs to a team', async () => {
    mockCreateTeam.mockImplementation(async () => {
      throw new AppError(ErrorCode.Conflict)
    })

    const res = await post(app, TEAMS_URL, body)

    expect(res.status).toBe(HttpStatus.CONFLICT)
  })
})
