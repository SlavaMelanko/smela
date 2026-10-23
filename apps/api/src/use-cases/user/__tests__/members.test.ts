import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { teamRepo, userRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { Action, Resource } from '@/types'

import {
  getTeamMemberPermissions,
  removeTeamMember,
  updateTeamMemberPermissions
} from '../members'

const { TEAM_1, USER_1 } = testUuids

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

  it('deletes the membership and keeps the user account untouched', async () => {
    const result = await removeTeamMember(TEAM_1, USER_1)

    expect(mockTeamRepoDeleteMembership).toHaveBeenCalledWith(USER_1, TEAM_1)
    expect(mockUserRepoUpdate).not.toHaveBeenCalled()
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
      await updateTeamMemberPermissions(MEMBERSHIP_ID, permissions)

      expect(mockTeamRepo.setMembershipPermissions).toHaveBeenCalledWith(
        MEMBERSHIP_ID,
        permissions
      )
    })

    it('returns updated membership permissions', async () => {
      const result = await updateTeamMemberPermissions(
        MEMBERSHIP_ID,
        permissions
      )

      expect(result.permissions[Resource.Teams]).toEqual({
        [Action.View]: true,
        [Action.Manage]: true
      })
    })
  })
})
