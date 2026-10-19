import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { teamRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { Action, Permission, Resource } from '@/types'

import { resolveUserTeams } from '../resolve-team'

describe('resolveUserTeams', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeamRepo = {
      findUserTeams: mock(async () => [
        {
          id: testUuids.TEAM_1,
          membershipId: testUuids.MEMBERSHIP_2,
          name: 'Acme Corp',
          position: 'Developer'
        },
        {
          id: testUuids.TEAM_2,
          membershipId: testUuids.MEMBERSHIP_1,
          name: 'Globex',
          position: null
        }
      ]),
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

  it('returns no team when user has no memberships', async () => {
    mockTeamRepo.findUserTeams.mockImplementation(async () => [])

    expect(await resolveUserTeams(testUuids.USER_1)).toEqual({
      team: undefined,
      teams: []
    })
    expect(mockTeamRepo.findMemberPermissions).not.toHaveBeenCalled()
  })

  it('returns the first team as active with its permissions and all teams without membership ids', async () => {
    const result = await resolveUserTeams(testUuids.USER_1)

    expect(mockTeamRepo.findMemberPermissions).toHaveBeenCalledTimes(1)
    expect(mockTeamRepo.findMemberPermissions).toHaveBeenCalledWith(
      testUuids.MEMBERSHIP_2
    )
    expect(result).toEqual({
      team: {
        id: testUuids.TEAM_1,
        name: 'Acme Corp',
        position: 'Developer',
        permissions: [Permission.ManageTeams, Permission.ViewTeams]
      },
      teams: [
        { id: testUuids.TEAM_1, name: 'Acme Corp', position: 'Developer' },
        { id: testUuids.TEAM_2, name: 'Globex', position: null }
      ]
    })
  })
})
