import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { db, teamRepo, userRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { Action, Resource, UserStatus } from '@/types'

import {
  getTeamMemberPermissions,
  removeTeamMember,
  updateTeamMemberPermissions
} from '../members'

const { TEAM_1, USER_1 } = testUuids

describe('removeTeamMember', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepoDeleteMember: any
  let mockUserRepoUpdate: any
  let mockTransaction: any

  beforeEach(async () => {
    mockTeamRepoDeleteMember = mock(async () => {})
    mockUserRepoUpdate = mock(async () => {})
    mockTransaction = mock(
      async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
        return callback({})
      }
    )

    await moduleMocker.mock('@/data', () => ({
      teamRepo: {
        deleteMember: mockTeamRepoDeleteMember
      } satisfies Partial<typeof teamRepo>,
      userRepo: { update: mockUserRepoUpdate } satisfies Partial<
        typeof userRepo
      >,
      db: { transaction: mockTransaction } satisfies Partial<typeof db>
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('deletes membership row in transaction', async () => {
    await removeTeamMember(TEAM_1, USER_1)

    expect(mockTeamRepoDeleteMember).toHaveBeenCalledWith(
      USER_1,
      TEAM_1,
      expect.anything()
    )
  })

  it('archives user in transaction', async () => {
    await removeTeamMember(TEAM_1, USER_1)

    expect(mockUserRepoUpdate).toHaveBeenCalledWith(
      USER_1,
      { status: UserStatus.Archived },
      expect.anything()
    )
  })

  it('runs delete and archive atomically in one transaction', async () => {
    await removeTeamMember(TEAM_1, USER_1)

    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it('returns success true', async () => {
    const result = await removeTeamMember(TEAM_1, USER_1)

    expect(result).toEqual({ success: true })
  })
})

describe('team member permissions', () => {
  const MEMBERSHIP_ID = testUuids.MEMBERSHIP_1
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeamRepo = {
      findMemberPermissions: mock(async () => [
        { action: Action.Manage, resource: Resource.Teams },
        { action: Action.View, resource: Resource.Teams }
      ]),
      setMemberPermissions: mock(async () => {})
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

      expect(mockTeamRepo.findMemberPermissions).toHaveBeenCalledWith(
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

      expect(mockTeamRepo.setMemberPermissions).toHaveBeenCalledWith(
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
