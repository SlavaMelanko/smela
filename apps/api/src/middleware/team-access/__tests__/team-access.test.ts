import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { onError } from '@/handlers'
import HttpStatus from '@/net/http/status'
import { Permission, Role, UserStatus } from '@/types'

import { requireTeamAccess } from '../team-access'

const mockTeamRepoFind = mock()
const mockTeamRepoFindMember = mock()
const mockResolveMemberPermissionList = mock(async () => [Permission.ViewTeams])

void mock.module('@/data', () => ({
  teamRepo: {
    find: mockTeamRepoFind,
    findMember: mockTeamRepoFindMember
  }
}))

void mock.module('@/use-cases/resolve-permissions', () => ({
  resolveMemberPermissionList: mockResolveMemberPermissionList
}))

// Claims grant both permissions so admins pass, while proving regular users
// get team permissions from their membership instead
const claims = [Permission.ViewTeams, Permission.ManageTeams]

const makeApp = (role: Role, userId: string) => {
  const app = new Hono<AppContext>()
  app.onError(onError)

  // Setup user context for all routes
  app.use('*', async (c, next) => {
    c.set('user', {
      id: userId,
      email: 'user@example.com',
      role,
      status: UserStatus.Active,
      permissions: claims
    })
    await next()
  })

  // Team-only routes
  app.use('/teams/:teamId', requireTeamAccess(Permission.ViewTeams))
  app.get('/teams/:teamId', c =>
    c.json({
      message: 'team success',
      teamPermissions: c.get('teamPermissions')
    })
  )

  // Member-specific routes
  app.get(
    '/teams/:teamId/members/:memberId',
    requireTeamAccess(Permission.ViewTeams),
    c => c.json({ message: 'member success' })
  )
  app.patch(
    '/teams/:teamId/members/:memberId',
    requireTeamAccess(Permission.ManageTeams),
    c => c.json({ message: 'member success' })
  )
  app.put(
    '/teams/:teamId/members/:memberId',
    requireTeamAccess(Permission.ManageTeams, { allowSelf: true }),
    c => c.json({ message: 'member success' })
  )

  return app
}

describe('requireTeamAccess', () => {
  beforeEach(() => {
    mockTeamRepoFind.mockClear()
    mockTeamRepoFindMember.mockClear()
    mockResolveMemberPermissionList.mockClear()

    // Default: team exists
    mockTeamRepoFind.mockImplementation(async () => ({
      id: testUuids.TEAM_1,
      name: 'Test Team',
      memberCount: 5
    }))
  })

  it('blocks all users when team does not exist', async () => {
    mockTeamRepoFind.mockImplementation(async () => undefined)

    const adminRes = await makeApp(Role.Admin, testUuids.ADMIN_1).request(
      `/teams/${testUuids.NON_EXISTENT}`
    )
    const userRes = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.NON_EXISTENT}`
    )

    expect(adminRes.status).toBe(HttpStatus.NOT_FOUND)
    expect(userRes.status).toBe(HttpStatus.NOT_FOUND)
    expect((await adminRes.json()).code).toBe(ErrorCode.NotFound)
    expect((await userRes.json()).code).toBe(ErrorCode.NotFound)
  })

  it('allows user who is team member on team routes', async () => {
    mockTeamRepoFindMember.mockImplementation(async () => ({
      userId: testUuids.USER_1,
      teamId: testUuids.TEAM_1
    }))

    const res = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.TEAM_1}`
    )

    expect(res.status).toBe(HttpStatus.OK)
    expect(mockTeamRepoFind).toHaveBeenCalledWith(testUuids.TEAM_1)
    expect(mockTeamRepoFindMember).toHaveBeenCalledWith(
      testUuids.TEAM_1,
      testUuids.USER_1
    )
    expect((await res.json()).message).toBe('team success')
  })

  it('resolves team permissions from user membership, not claims', async () => {
    mockTeamRepoFindMember.mockImplementation(async () => ({
      membershipId: testUuids.MEMBERSHIP_2,
      userId: testUuids.USER_1,
      teamId: testUuids.TEAM_1
    }))

    const res = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.TEAM_1}`
    )

    expect(mockResolveMemberPermissionList).toHaveBeenCalledWith(
      testUuids.MEMBERSHIP_2
    )
    expect((await res.json()).teamPermissions).toEqual([Permission.ViewTeams])
  })

  it('resolves admin team permissions from claims', async () => {
    const res = await makeApp(Role.Admin, testUuids.ADMIN_1).request(
      `/teams/${testUuids.TEAM_1}`
    )

    expect(mockResolveMemberPermissionList).not.toHaveBeenCalled()
    expect((await res.json()).teamPermissions).toEqual(claims)
  })

  it('blocks user who is not team member on team routes', async () => {
    mockTeamRepoFindMember.mockImplementation(async () => undefined)

    const res = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.TEAM_1}`
    )

    expect(res.status).toBe(HttpStatus.FORBIDDEN)
    expect((await res.json()).code).toBe(ErrorCode.Forbidden)
  })

  it('allows user on member routes when both user and target are team members', async () => {
    mockTeamRepoFindMember.mockImplementation(async (teamId, userId) => ({
      userId,
      teamId,
      joinedAt: new Date()
    }))

    const res = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_2}`
    )

    expect(res.status).toBe(HttpStatus.OK)
    expect(mockTeamRepoFindMember).toHaveBeenCalledTimes(2) // Parallel calls
    expect(mockTeamRepoFindMember).toHaveBeenCalledWith(
      testUuids.TEAM_1,
      testUuids.USER_1
    )
    expect(mockTeamRepoFindMember).toHaveBeenCalledWith(
      testUuids.TEAM_1,
      testUuids.USER_2
    )
  })

  it('blocks user who is not team member on member routes', async () => {
    mockTeamRepoFindMember.mockImplementation(async (teamId, userId) => {
      return userId === testUuids.USER_1 ? undefined : { userId, teamId }
    })

    const res = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_2}`
    )

    expect(res.status).toBe(HttpStatus.FORBIDDEN)
    expect((await res.json()).code).toBe(ErrorCode.Forbidden)
  })

  it('blocks user on member routes when target member is not in team', async () => {
    mockTeamRepoFindMember.mockImplementation(async (teamId, userId) => {
      return userId === testUuids.USER_2 ? undefined : { userId, teamId }
    })

    const res = await makeApp(Role.User, testUuids.USER_1).request(
      `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_2}`
    )

    expect(res.status).toBe(HttpStatus.NOT_FOUND)
    expect((await res.json()).code).toBe(ErrorCode.NotFound)
  })

  it('allows admin on team routes', async () => {
    const res = await makeApp(Role.Admin, testUuids.ADMIN_1).request(
      `/teams/${testUuids.TEAM_1}`
    )

    expect(res.status).toBe(HttpStatus.OK)
    expect(mockTeamRepoFind).toHaveBeenCalledWith(testUuids.TEAM_1)
    expect(mockTeamRepoFindMember).not.toHaveBeenCalled()
  })

  it('allows admin on member routes when member exists', async () => {
    mockTeamRepoFindMember.mockImplementation(async () => ({
      userId: testUuids.USER_1,
      teamId: testUuids.TEAM_1
    }))

    const res = await makeApp(Role.Admin, testUuids.ADMIN_1).request(
      `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_1}`
    )

    expect(res.status).toBe(HttpStatus.OK)
    expect(mockTeamRepoFind).toHaveBeenCalledWith(testUuids.TEAM_1)
    expect(mockTeamRepoFindMember).toHaveBeenCalledWith(
      testUuids.TEAM_1,
      testUuids.USER_1
    )
  })

  it('blocks admin when target member is not in team', async () => {
    mockTeamRepoFindMember.mockImplementation(async () => undefined)

    const res = await makeApp(Role.Admin, testUuids.ADMIN_1).request(
      `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_1}`
    )

    expect(res.status).toBe(HttpStatus.NOT_FOUND)
    expect((await res.json()).code).toBe(ErrorCode.NotFound)
  })

  it('allows owner access identical to admin', async () => {
    const res = await makeApp(Role.Owner, testUuids.OWNER_1).request(
      `/teams/${testUuids.TEAM_1}`
    )

    expect(res.status).toBe(HttpStatus.OK)
    expect(mockTeamRepoFind).toHaveBeenCalledWith(testUuids.TEAM_1)
    expect(mockTeamRepoFindMember).not.toHaveBeenCalled()
  })

  describe('permission check', () => {
    beforeEach(() => {
      mockTeamRepoFindMember.mockImplementation(async (teamId, userId) => ({
        membershipId: testUuids.MEMBERSHIP_2,
        userId,
        teamId
      }))
    })

    it('blocks user when only claims include the permission', async () => {
      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_2}`,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect((await res.json()).code).toBe(ErrorCode.Forbidden)
    })

    it('allows user when membership grants the permission', async () => {
      mockResolveMemberPermissionList.mockImplementationOnce(async () => [
        Permission.ManageTeams
      ])

      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_2}`,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.OK)
    })

    it('blocks self access without allowSelf', async () => {
      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_1}`,
        { method: 'PATCH' }
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('allows self access with allowSelf', async () => {
      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_1}`,
        { method: 'PUT' }
      )

      expect(res.status).toBe(HttpStatus.OK)
    })

    it('blocks other member access with allowSelf', async () => {
      const res = await makeApp(Role.User, testUuids.USER_1).request(
        `/teams/${testUuids.TEAM_1}/members/${testUuids.USER_2}`,
        { method: 'PUT' }
      )

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })
  })
})
