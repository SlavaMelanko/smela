import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { rbacRepo, Team, teamRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { getTeamCreatorPermissions } from '@/types'

import { createTeam, updateTeam } from '../teams'

const { TEAM_1, USER_1 } = testUuids

describe('createTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const input = { name: 'New Team', website: 'https://newteam.com' }

  let mockTeam: Team
  let mockTeamRepo: any
  let mockRbacRepo: any

  beforeEach(async () => {
    mockTeam = {
      id: TEAM_1,
      name: 'New Team',
      website: 'https://newteam.com',
      description: null,
      createdBy: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockTeamRepo = {
      create: mock(async () => mockTeam),
      createMember: mock(async () => ({
        id: 1,
        userId: USER_1,
        teamId: TEAM_1,
        position: null,
        invitedBy: null,
        joinedAt: new Date('2024-01-01')
      }))
    } satisfies Partial<typeof teamRepo>

    mockRbacRepo = {
      setMemberPermissions: mock(async () => {})
    } satisfies Partial<typeof rbacRepo>

    const transaction = async <T>(callback: (tx: unknown) => Promise<T>) =>
      callback({})

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo,
      rbacRepo: mockRbacRepo,
      db: { transaction }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('creates team, records creator, and adds them as member with every team permission', async () => {
    const result = await createTeam(USER_1, input)

    expect(mockTeamRepo.create).toHaveBeenCalledWith(
      { ...input, createdBy: USER_1 },
      {}
    )
    expect(mockTeamRepo.createMember).toHaveBeenCalledWith(
      { userId: USER_1, teamId: TEAM_1 },
      {}
    )
    expect(mockRbacRepo.setMemberPermissions).toHaveBeenCalledWith(
      1,
      getTeamCreatorPermissions(),
      {}
    )
    expect(result).toEqual({ team: mockTeam })
  })
})

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
      createdBy: null,
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

  it('updates team when it exists', async () => {
    const params = { name: 'Updated Team' }

    const result = await updateTeam(TEAM_1, params)

    expect(mockTeamRepo.update).toHaveBeenCalledWith(TEAM_1, params)
    expect(result).toEqual({ team: mockUpdatedTeam })
  })
})
