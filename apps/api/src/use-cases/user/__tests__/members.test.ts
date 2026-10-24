import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { teamRepo, userRepo } from '@/data'

import {
  buildTeam,
  buildTeamMember,
  ModuleMocker,
  testUuids
} from '@/__tests__'
import { ErrorCode } from '@/errors'
import { Action, MembershipStatus, Resource, Role } from '@/types'

import {
  getTeamMemberPermissions,
  removeTeamMember,
  updateTeamMemberPermissions
} from '../members'

const { USER_1, USER_2 } = testUuids

const creatorTeam = buildTeam({ creator: { id: USER_1, nickname: 'Alice' } })

describe('removeTeamMember', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepoDeleteMembership: any
  let mockUserRepoUpdate: any

  beforeEach(async () => {
    mockTeamRepoDeleteMembership = mock(async () => {})
    mockUserRepoUpdate = mock(async () => {})

    await moduleMocker.mock('@/data', () => ({
      teamRepo: {
        deleteMembership: mockTeamRepoDeleteMembership
      } satisfies Partial<typeof teamRepo>,
      userRepo: { update: mockUserRepoUpdate } satisfies Partial<
        typeof userRepo
      >
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('deletes a non-creator membership and keeps the user account untouched', async () => {
    const team = buildTeam({ creator: { id: USER_2, nickname: 'Bob' } })

    const result = await removeTeamMember(
      team,
      buildTeamMember(USER_1),
      Role.User
    )

    expect(mockTeamRepoDeleteMembership).toHaveBeenCalledWith(USER_1, team.id)
    expect(mockUserRepoUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })

  it('rejects removing the active creator', async () => {
    const error = await removeTeamMember(
      creatorTeam,
      buildTeamMember(USER_1),
      Role.User
    ).catch((err: unknown) => err)

    expect(error).toMatchObject({ code: ErrorCode.Forbidden })
    expect(mockTeamRepoDeleteMembership).not.toHaveBeenCalled()
  })

  it.each([Role.Admin, Role.Owner])(
    'allows platform %s to remove the creator',
    async role => {
      const result = await removeTeamMember(
        creatorTeam,
        buildTeamMember(USER_1),
        role
      )

      expect(result).toEqual({ success: true })
      expect(mockTeamRepoDeleteMembership).toHaveBeenCalledWith(
        USER_1,
        creatorTeam.id
      )
    }
  )

  it('allows removal when the team has no creator', async () => {
    const result = await removeTeamMember(
      buildTeam(),
      buildTeamMember(USER_1),
      Role.User
    )

    expect(result).toEqual({ success: true })
  })

  it('does not protect a pending membership of the creator', async () => {
    const member = {
      ...buildTeamMember(USER_1),
      status: MembershipStatus.Pending
    }

    const result = await removeTeamMember(creatorTeam, member, Role.User)

    expect(result).toEqual({ success: true })
  })
})

describe('team member permissions', () => {
  const MEMBERSHIP_ID = testUuids.MEMBERSHIP_1
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeamRepo = {
      findMembershipPermissions: mock(async () => [
        { action: Action.Manage, resource: Resource.Teams },
        { action: Action.View, resource: Resource.Teams }
      ]),
      setMembershipPermissions: mock(async () => {})
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  describe('getTeamMemberPermissions', () => {
    it('merges membership permissions into the member baseline', async () => {
      const result = await getTeamMemberPermissions(MEMBERSHIP_ID)

      expect(mockTeamRepo.findMembershipPermissions).toHaveBeenCalledWith(
        MEMBERSHIP_ID
      )
      expect(result).toEqual({
        permissions: {
          [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
        }
      })
    })
  })

  describe('updateTeamMemberPermissions', () => {
    const permissions = {
      [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
    }

    it('writes permissions to membership', async () => {
      await updateTeamMemberPermissions(
        buildTeam(),
        buildTeamMember(USER_1),
        Role.User,
        permissions
      )

      expect(mockTeamRepo.setMembershipPermissions).toHaveBeenCalledWith(
        MEMBERSHIP_ID,
        permissions
      )
    })

    it('returns updated membership permissions', async () => {
      const result = await updateTeamMemberPermissions(
        buildTeam(),
        buildTeamMember(USER_1),
        Role.User,
        permissions
      )

      expect(result.permissions[Resource.Teams]).toEqual({
        [Action.View]: true,
        [Action.Manage]: true
      })
    })

    it('rejects editing the active creator permissions', async () => {
      const error = await updateTeamMemberPermissions(
        creatorTeam,
        buildTeamMember(USER_1),
        Role.User,
        permissions
      ).catch((err: unknown) => err)

      expect(error).toMatchObject({ code: ErrorCode.Forbidden })
      expect(mockTeamRepo.setMembershipPermissions).not.toHaveBeenCalled()
    })

    it('allows a member to edit a non-creator in a team with a creator', async () => {
      await updateTeamMemberPermissions(
        creatorTeam,
        buildTeamMember(USER_2),
        Role.User,
        permissions
      )

      expect(mockTeamRepo.setMembershipPermissions).toHaveBeenCalledWith(
        MEMBERSHIP_ID,
        permissions
      )
    })

    it.each([Role.Admin, Role.Owner])(
      'allows platform %s to edit the creator permissions',
      async role => {
        await updateTeamMemberPermissions(
          creatorTeam,
          buildTeamMember(USER_1),
          role,
          permissions
        )

        expect(mockTeamRepo.setMembershipPermissions).toHaveBeenCalledWith(
          MEMBERSHIP_ID,
          permissions
        )
      }
    )
  })
})
