import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { teamRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { Action, Permission, Resource } from '@/types'

import { resolveUserTeam } from '../resolve-team'

describe('resolveUserTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeamRepo = {
      findUserTeam: mock(async () => ({
        id: testUuids.TEAM_1,
        membershipId: 7,
        name: 'Acme Corp',
        position: 'Developer'
      })),
      findMemberPermissions: mock(async () => [
        { action: Action.Manage, resource: Resource.Teams },
        { action: Action.View, resource: Resource.Teams }
      ])
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({ teamRepo: mockTeamRepo }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('returns undefined when user has no team', async () => {
    mockTeamRepo.findUserTeam.mockImplementation(async () => undefined)

    expect(await resolveUserTeam(testUuids.USER_1)).toBeUndefined()
    expect(mockTeamRepo.findMemberPermissions).not.toHaveBeenCalled()
  })

  it('returns team with membership permissions and without membership id', async () => {
    const team = await resolveUserTeam(testUuids.USER_1)

    expect(mockTeamRepo.findMemberPermissions).toHaveBeenCalledWith(7)
    expect(team).toEqual({
      id: testUuids.TEAM_1,
      name: 'Acme Corp',
      position: 'Developer',
      permissions: [Permission.ManageTeams, Permission.ViewTeams]
    })
  })
})
