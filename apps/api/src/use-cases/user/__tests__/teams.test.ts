import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team, teamRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'

import { createTeam, updateTeam } from '../teams'

const { TEAM_1, USER_1 } = testUuids

describe('createTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const input = { name: 'New Team', website: 'https://newteam.com' }

  let mockTeam: Team
  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeam = {
      id: TEAM_1,
      name: 'New Team',
      website: 'https://newteam.com',
      description: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockTeamRepo = {
      findUserTeam: mock(async () => undefined),
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

    const transaction = async <T>(callback: (tx: unknown) => Promise<T>) =>
      callback({})

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo,
      db: { transaction }
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('creates team and adds creator as member', async () => {
    const result = await createTeam(USER_1, input)

    expect(mockTeamRepo.create).toHaveBeenCalledWith(input, {})
    expect(mockTeamRepo.createMember).toHaveBeenCalledWith(
      { userId: USER_1, teamId: TEAM_1 },
      {}
    )
    expect(result).toEqual({ team: mockTeam })
  })

  it('rejects user who already belongs to a team', async () => {
    mockTeamRepo.findUserTeam.mockImplementation(async () => ({
      id: TEAM_1,
      name: 'Existing',
      position: null
    }))

    expect(createTeam(USER_1, input)).rejects.toMatchObject({
      code: ErrorCode.Conflict
    })
    expect(mockTeamRepo.create).not.toHaveBeenCalled()
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
