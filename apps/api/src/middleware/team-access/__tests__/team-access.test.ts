import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import HttpStatus from '@/net/http/status'
import { Role, UserStatus } from '@/types'

import { requireTeamAccess } from '../team-access'

const mockTeamRepoFindMember = mock()

void mock.module('@/data', () => ({
  teamRepo: {
    findMember: mockTeamRepoFindMember
  }
}))

const makeApp = (role: Role, userId: string) => {
  const app = new Hono<AppContext>()
  app.onError(onError)
  app.use('/teams/:teamId', async (c, next) => {
    c.set('user', {
      id: userId,
      email: 'user@example.com',
      role,
      status: UserStatus.Active
    })
    await next()
  })
  app.use('/teams/:teamId', requireTeamAccess)
  app.get('/teams/:teamId', c => c.json({ message: 'success' }))

  return app
}

describe('Team Access Middleware', () => {
  beforeEach(() => {
    mockTeamRepoFindMember.mockClear()
  })

  describe('Regular User Access', () => {
    it('should allow access when user has valid team membership', async () => {
      mockTeamRepoFindMember.mockImplementation(async () => ({
        userId: testUuids.USER_1,
        teamId: testUuids.TEAM_1,
        joinedAt: new Date()
      }))

      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}`
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockTeamRepoFindMember).toHaveBeenCalledTimes(1)
      expect(mockTeamRepoFindMember).toHaveBeenCalledWith(
        testUuids.TEAM_1,
        testUuids.USER_1
      )
      expect((await res.json()).message).toBe('success')
    })

    it('should throw Forbidden when user has no team membership', async () => {
      mockTeamRepoFindMember.mockImplementation(async () => undefined)

      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}`
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockTeamRepoFindMember).toHaveBeenCalledWith(
        testUuids.TEAM_1,
        testUuids.USER_1
      )
      expect((await res.json()).code).toBe(ErrorCode.Forbidden)
    })
  })

  describe('Admin and Owner Access', () => {
    it('should allow Admin access without querying the database', async () => {
      const res = await makeApp(Role.Admin, testUuids.ADMIN_1).request(
        `/teams/${testUuids.TEAM_1}`
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockTeamRepoFindMember).not.toHaveBeenCalled()
    })

    it('should allow Owner access without querying the database', async () => {
      const res = await makeApp(Role.Owner, testUuids.OWNER_1).request(
        `/teams/${testUuids.TEAM_1}`
      )

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockTeamRepoFindMember).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should propagate database errors', async () => {
      mockTeamRepoFindMember.mockImplementation(async () => {
        throw new Error('Database connection failed')
      })

      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}`
      )

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
