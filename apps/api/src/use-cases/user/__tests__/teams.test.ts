import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'

import { updateTeam } from '../teams'

const { TEAM_1 } = testUuids

describe('updateTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockExistingTeam: Team
  let mockUpdatedTeam: Team
  let mockTeamRepoFindById: any
  let mockTeamRepoUpdate: any
  let mockTeamRepoFindMember: any

  beforeEach(async () => {
    mockExistingTeam = {
      id: TEAM_1,
      name: 'Old Team',
      website: 'https://oldteam.com',
      description: 'An old team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockUpdatedTeam = {
      ...mockExistingTeam,
      name: 'Updated Team',
      updatedAt: new Date('2024-01-02')
    }

    mockTeamRepoFindById = mock(async () => mockExistingTeam)
    mockTeamRepoUpdate = mock(async () => mockUpdatedTeam)
    mockTeamRepoFindMember = mock(async () => ({
      userId: testUuids.USER_1,
      teamId: TEAM_1
    }))

    await moduleMocker.mock('@/data', () => ({
      teamRepo: {
        findById: mockTeamRepoFindById,
        update: mockTeamRepoUpdate,
        findMember: mockTeamRepoFindMember
      }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should update team when it exists', async () => {
    const params = { name: 'Updated Team' }

    const result = await updateTeam(TEAM_1, params)

    expect(mockTeamRepoUpdate).toHaveBeenCalledWith(TEAM_1, params)
    expect(result).toEqual({ team: mockUpdatedTeam })
  })
})
