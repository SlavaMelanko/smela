import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { ActivePermissionRow, rbacRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { Action, Permission, Resource } from '@/types'

import { resolvePermissionList } from '../resolve-permissions'

describe('resolvePermissionList', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockRbacRepo: any

  beforeEach(async () => {
    mockRbacRepo = {
      findUserPermissions: mock(async (): Promise<ActivePermissionRow[]> => [])
    } satisfies Partial<typeof rbacRepo>

    await moduleMocker.mock('@/data', () => ({
      rbacRepo: mockRbacRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('returns undefined when user has no permissions', async () => {
    const result = await resolvePermissionList(testUuids.USER_1)

    expect(result).toBeUndefined()
    expect(mockRbacRepo.findUserPermissions).toHaveBeenCalledWith(
      testUuids.USER_1
    )
  })

  it('maps action:resource rows to typed Permission values', async () => {
    mockRbacRepo.findUserPermissions.mockImplementation(async () => [
      { action: Action.View, resource: Resource.Users },
      { action: Action.Manage, resource: Resource.Teams }
    ])

    const result = await resolvePermissionList(testUuids.ADMIN_1)

    expect(result).toEqual([Permission.ViewUsers, Permission.ManageTeams])
  })

  it('passes userId to the repository', async () => {
    await resolvePermissionList(testUuids.ADMIN_1)

    expect(mockRbacRepo.findUserPermissions).toHaveBeenCalledWith(
      testUuids.ADMIN_1
    )
    expect(mockRbacRepo.findUserPermissions).toHaveBeenCalledTimes(1)
  })

  it('returns all permissions when repository returns multiple rows', async () => {
    mockRbacRepo.findUserPermissions.mockImplementation(async () => [
      { action: Action.View, resource: Resource.Users },
      { action: Action.View, resource: Resource.Admins },
      { action: Action.View, resource: Resource.Teams },
      { action: Action.Manage, resource: Resource.Users },
      { action: Action.Manage, resource: Resource.Admins },
      { action: Action.Manage, resource: Resource.Teams }
    ])

    const result = await resolvePermissionList(testUuids.USER_1)

    expect(result).toHaveLength(6)
    expect(result).toContain(Permission.ViewUsers)
    expect(result).toContain(Permission.ViewAdmins)
    expect(result).toContain(Permission.ViewTeams)
    expect(result).toContain(Permission.ManageUsers)
    expect(result).toContain(Permission.ManageAdmins)
    expect(result).toContain(Permission.ManageTeams)
  })
})
