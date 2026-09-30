import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team, teamRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'

import { updateTeam } from '../teams'

const { TEAM_1 } = testUuids

describe('updateTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockExistingTeam: Team
  let mockUpdatedTeam: Team
  let mockTeamRepo: any

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

    mockTeamRepo = {
      update: mock(async () => mockUpdatedTeam)
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('should update team when it exists', async () => {
    const params = { name: 'Updated Team' }

    const result = await updateTeam(TEAM_1, params)

    expect(mockTeamRepo.update).toHaveBeenCalledWith(TEAM_1, params)
    expect(result).toEqual({ team: mockUpdatedTeam })
  })
})
