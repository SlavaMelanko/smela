import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team, teamRepo, TeamSearchResult } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'

import { createTeam, getTeams } from '../teams'

const { TEAM_1 } = testUuids

describe('getTeams', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const DEFAULT_PAGINATION = { page: 1, limit: 25 }

  let mockSearchResult: TeamSearchResult
  let mockTeamRepo: any

  beforeEach(async () => {
    mockSearchResult = {
      teams: [
        {
          id: TEAM_1,
          name: 'Acme Corp',
          website: 'https://acme.com',
          description: 'A test team',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          memberCount: 3
        }
      ],
      pagination: { page: 1, limit: 25, total: 1, totalPages: 1 }
    }

    mockTeamRepo = {
      search: mock(async () => mockSearchResult)
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('calls teamRepo.search with correct params', async () => {
    await getTeams({ search: 'acme' }, DEFAULT_PAGINATION)

    expect(mockTeamRepo.search).toHaveBeenCalledWith(
      { search: 'acme' },
      DEFAULT_PAGINATION
    )
  })

  it('returns teams and pagination', async () => {
    const result = await getTeams({}, DEFAULT_PAGINATION)

    expect(result).toEqual(mockSearchResult)
  })
})

describe('createTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeam: Team
  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeam = {
      id: TEAM_1,
      name: 'New Team',
      website: 'https://newteam.com',
      description: 'A new team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockTeamRepo = {
      create: mock(async () => mockTeam)
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('creates team', async () => {
    const params = { name: 'New Team', website: 'https://newteam.com' }

    const result = await createTeam(params)

    expect(mockTeamRepo.create).toHaveBeenCalledWith(params)
    expect(result).toEqual({ team: mockTeam })
  })
})
