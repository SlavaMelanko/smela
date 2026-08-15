import type { Hono } from 'hono'

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import {
  createTestApp,
  doRequest,
  get,
  ModuleMocker,
  patch,
  post,
  testUuids,
  withClaims
} from '@/__tests__'
import { HttpStatus } from '@/net/http'
import { Permission, Role } from '@/types'

import { teamsRoute } from '../../../..'

describe('user /teams/:teamId/members/:memberId', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  // Local team id because testUuids.TEAM_1 fails z.uuid() (invalid variant nibble)
  const TEAM_ID = '00000000-0000-4000-a0c0-000000000001'
  const MEMBERS_URL = `/api/v1/user/verified/teams/${TEAM_ID}/members`
  const MEMBER_URL = `${MEMBERS_URL}/${testUuids.USER_2}`
  const SELF_URL = `${MEMBERS_URL}/${testUuids.USER_1}`

  let app: Hono

  let mockTeam: { id: string; name: string }
  let mockTeamRepo: any

  let mockUpdateTeamMember: any
  let mockRemoveTeamMember: any
  let mockResendMemberInvite: any
  let mockCancelMemberInvite: any

  const buildApp = (permissions: string[]) =>
    createTestApp('/api/v1/user/verified', teamsRoute, [
      withClaims({
        id: testUuids.USER_1,
        role: Role.User,
        permissions
      })
    ])

  beforeEach(async () => {
    mockTeam = { id: TEAM_ID, name: 'Engineering' }
    mockTeamRepo = {
      find: mock(async () => mockTeam),
      findMember: mock(async (_teamId: string, memberId: string) => ({
        id: memberId,
        firstName: 'Alice',
        email: 'alice@example.com'
      }))
    }

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))

    mockUpdateTeamMember = mock(async () => ({
      member: { id: testUuids.USER_2, firstName: 'Alice' }
    }))
    mockRemoveTeamMember = mock(async () => ({ success: true }))
    mockResendMemberInvite = mock(async () => ({ success: true }))
    mockCancelMemberInvite = mock(async () => ({ success: true }))

    await moduleMocker.mock('@/use-cases/user', () => ({
      updateTeamMember: mockUpdateTeamMember,
      removeTeamMember: mockRemoveTeamMember,
      resendMemberInvite: mockResendMemberInvite,
      cancelMemberInvite: mockCancelMemberInvite
    }))

    app = buildApp([Permission.ViewTeams, Permission.ManageTeams])
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('GET /teams/:teamId/members/:memberId', () => {
    it('should return target member resolved by team-access middleware', async () => {
      const res = await get(app, MEMBER_URL)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockTeamRepo.findMember).toHaveBeenCalledWith(
        TEAM_ID,
        testUuids.USER_2
      )

      const data = await res.json()
      expect(data.member).toMatchObject({ id: testUuids.USER_2 })
    })

    it('should reject invalid member id', async () => {
      const res = await get(app, `${MEMBERS_URL}/not-a-uuid`)

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockTeamRepo.findMember).not.toHaveBeenCalled()
    })

    it('should return 403 when claims lack view permission', async () => {
      const noPermissionApp = buildApp([])

      const res = await get(noPermissionApp, MEMBER_URL)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
    })

    it('should return 404 when target member is not in team', async () => {
      mockTeamRepo.findMember.mockImplementation(
        async (_teamId: string, memberId: string) =>
          memberId === testUuids.USER_2 ? null : { id: memberId }
      )

      const res = await get(app, MEMBER_URL)

      expect(res.status).toBe(HttpStatus.NOT_FOUND)
    })
  })

  describe('PATCH /teams/:teamId/members/:memberId', () => {
    const body = { membership: { position: 'Lead' } }

    it('should update member and return OK status', async () => {
      const res = await patch(app, MEMBER_URL, body)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateTeamMember).toHaveBeenCalledWith(
        TEAM_ID,
        testUuids.USER_2,
        body
      )

      const data = await res.json()
      expect(data.member).toMatchObject({ id: testUuids.USER_2 })
    })

    it('should reject unknown body fields', async () => {
      const res = await patch(app, MEMBER_URL, { ...body, hacker: true })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      expect(mockUpdateTeamMember).not.toHaveBeenCalled()
    })

    it('should return 403 for non-self update without manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await patch(viewOnlyApp, MEMBER_URL, body)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateTeamMember).not.toHaveBeenCalled()
    })

    it('should allow self-update of member fields without manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])
      const selfBody = { member: { firstName: 'Jane', lastName: 'Smith' } }

      const res = await patch(viewOnlyApp, SELF_URL, selfBody)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockUpdateTeamMember).toHaveBeenCalledWith(
        TEAM_ID,
        testUuids.USER_1,
        selfBody
      )
    })

    it('should forbid self-update of membership fields without manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])
      const selfBody = {
        member: { firstName: 'Jane' },
        membership: { position: 'Lead' }
      }

      const res = await patch(viewOnlyApp, SELF_URL, selfBody)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockUpdateTeamMember).not.toHaveBeenCalled()
    })

    it('should return error status when use case throws', async () => {
      mockUpdateTeamMember.mockImplementation(async () => {
        throw new Error('Member not found')
      })

      const res = await patch(app, MEMBER_URL, body)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })

  describe('DELETE /teams/:teamId/members/:memberId', () => {
    it('should remove member and return OK status', async () => {
      const res = await doRequest(app, MEMBER_URL, 'DELETE')

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockRemoveTeamMember).toHaveBeenCalledWith(
        TEAM_ID,
        testUuids.USER_2
      )

      const data = await res.json()
      expect(data).toEqual({ success: true })
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await doRequest(viewOnlyApp, MEMBER_URL, 'DELETE')

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockRemoveTeamMember).not.toHaveBeenCalled()
    })
  })

  describe('POST /teams/:teamId/members/:memberId/resend-invite', () => {
    it('should resend invite with team, target member, and inviter id', async () => {
      const res = await post(app, `${MEMBER_URL}/resend-invite`)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockResendMemberInvite).toHaveBeenCalledWith(
        mockTeam,
        expect.objectContaining({ id: testUuids.USER_2 }),
        testUuids.USER_1
      )
    })

    it('should return 403 when claims lack manage permission', async () => {
      const viewOnlyApp = buildApp([Permission.ViewTeams])

      const res = await post(viewOnlyApp, `${MEMBER_URL}/resend-invite`)

      expect(res.status).toBe(HttpStatus.FORBIDDEN)
      expect(mockResendMemberInvite).not.toHaveBeenCalled()
    })
  })

  describe('POST /teams/:teamId/members/:memberId/cancel-invite', () => {
    it('should cancel invite for target member', async () => {
      const res = await post(app, `${MEMBER_URL}/cancel-invite`)

      expect(res.status).toBe(HttpStatus.OK)
      expect(mockCancelMemberInvite).toHaveBeenCalledWith(
        expect.objectContaining({ id: testUuids.USER_2 })
      )
    })

    it('should return error status when use case throws', async () => {
      mockCancelMemberInvite.mockImplementation(async () => {
        throw new Error('Invite not found')
      })

      const res = await post(app, `${MEMBER_URL}/cancel-invite`)

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
