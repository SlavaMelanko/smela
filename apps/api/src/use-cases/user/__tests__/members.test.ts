import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { teamRepo, userRepo } from '@/data'

import { createTransactionMock, ModuleMocker, testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import { Action, MembershipStatus, Resource, Role } from '@/types'

import {
  getTeamMemberPermissions,
  removeTeamMember,
  updateTeamMemberPermissions
} from '../members'

const { TEAM_1, USER_1 } = testUuids

describe('removeTeamMember', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)
  let mockTeamRepo: any
  let mockUserRepoUpdate: any

  beforeEach(async () => {
    mockTeamRepo = {
      lockMembershipForRemoval: mock(async () => ({
        userId: USER_1,
        status: MembershipStatus.Active,
        createdBy: testUuids.USER_2
      })),
      deleteMembership: mock(async () => {})
    } satisfies Partial<typeof teamRepo>
    mockUserRepoUpdate = mock(async () => {})
    await moduleMocker.mock('@/data', () => ({
      db: createTransactionMock(),
      teamRepo: mockTeamRepo,
      userRepo: { update: mockUserRepoUpdate } satisfies Partial<
        typeof userRepo
      >
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('deletes a non-creator membership and keeps the user account untouched', async () => {
    const result = await removeTeamMember(TEAM_1, USER_1, Role.User)
    expect(mockTeamRepo.lockMembershipForRemoval).toHaveBeenCalledWith(
      TEAM_1,
      USER_1,
      {}
    )
    expect(mockTeamRepo.deleteMembership).toHaveBeenCalledWith(
      USER_1,
      TEAM_1,
      {}
    )
    expect(mockUserRepoUpdate).not.toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })

  it.each([USER_1, USER_1.toUpperCase()])(
    'rejects removing the active creator using %s',
    async memberId => {
      mockTeamRepo.lockMembershipForRemoval.mockResolvedValue({
        userId: USER_1,
        status: MembershipStatus.Active,
        createdBy: USER_1
      })
      expect(
        removeTeamMember(TEAM_1, memberId, Role.User)
      ).rejects.toMatchObject({ code: ErrorCode.Forbidden })
      expect(mockTeamRepo.deleteMembership).not.toHaveBeenCalled()
    }
  )

  it.each([Role.Admin, Role.Owner])(
    'preserves creator removal for platform %s',
    async role => {
      mockTeamRepo.lockMembershipForRemoval.mockResolvedValue({
        userId: USER_1,
        status: MembershipStatus.Active,
        createdBy: USER_1
      })
      expect(await removeTeamMember(TEAM_1, USER_1, role)).toEqual({
        success: true
      })
      expect(mockTeamRepo.deleteMembership).toHaveBeenCalledWith(
        USER_1,
        TEAM_1,
        {}
      )
    }
  )

  it.each([null, testUuids.USER_2])(
    'allows removal when the creator is %s',
    async createdBy => {
      mockTeamRepo.lockMembershipForRemoval.mockResolvedValue({
        userId: USER_1,
        status: MembershipStatus.Active,
        createdBy
      })
      expect(await removeTeamMember(TEAM_1, USER_1, Role.User)).toEqual({
        success: true
      })
    }
  )

  it('does not protect a pending membership matching createdBy', async () => {
    mockTeamRepo.lockMembershipForRemoval.mockResolvedValue({
      userId: USER_1,
      status: MembershipStatus.Pending,
      createdBy: USER_1
    })
    expect(await removeTeamMember(TEAM_1, USER_1, Role.User)).toEqual({
      success: true
    })
  })

  it('returns NotFound if the membership disappeared before the transaction', async () => {
    mockTeamRepo.lockMembershipForRemoval.mockResolvedValue(undefined)
    expect(removeTeamMember(TEAM_1, USER_1, Role.User)).rejects.toMatchObject({
      code: ErrorCode.NotFound
    })
    expect(mockTeamRepo.deleteMembership).not.toHaveBeenCalled()
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
