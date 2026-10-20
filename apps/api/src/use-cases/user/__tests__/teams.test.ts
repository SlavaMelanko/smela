import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import type { Team, TeamMember, teamRepo } from '@/data'

import { ModuleMocker, testUuids } from '@/__tests__'
import { ErrorCode } from '@/errors'
import {
  Action,
  getMemberFullPermissions,
  MembershipStatus,
  Permission,
  Resource
} from '@/types'

import { createTeam, switchTeam, updateTeam } from '../teams'

const { MEMBERSHIP_1, MEMBERSHIP_2, TEAM_1, TEAM_2, USER_1 } = testUuids

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
      createdBy: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    mockTeamRepo = {
      create: mock(async () => mockTeam),
      createMember: mock(async () => ({
        id: testUuids.MEMBERSHIP_1,
        userId: USER_1,
        teamId: TEAM_1,
        position: null,
        status: MembershipStatus.Active,
        invitedBy: null,
        joinedAt: new Date('2024-01-01'),
        lastActiveAt: new Date('2024-01-01')
      })),
      setMemberPermissions: mock(async () => {})
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
    expect(mockTeamRepo.setMemberPermissions).toHaveBeenCalledWith(
      testUuids.MEMBERSHIP_1,
      getMemberFullPermissions(),
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

describe('switchTeam', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  let mockTeamRepo: any

  beforeEach(async () => {
    mockTeamRepo = {
      markMemberLastActive: mock(async (): Promise<TeamMember | undefined> => ({
        id: MEMBERSHIP_2,
        userId: USER_1,
        teamId: TEAM_2,
        position: null,
        status: MembershipStatus.Active,
        invitedBy: null,
        joinedAt: new Date('2024-01-01'),
        lastActiveAt: new Date('2024-01-02')
      })),
      findUserTeams: mock(async () => [
        {
          id: TEAM_2,
          membershipId: MEMBERSHIP_2,
          name: 'Globex',
          position: null
        },
        {
          id: TEAM_1,
          membershipId: MEMBERSHIP_1,
          name: 'Acme',
          position: 'Developer'
        }
      ]),
      findMemberPermissions: mock(async () => [
        { action: Action.View, resource: Resource.Teams }
      ])
    } satisfies Partial<typeof teamRepo>

    await moduleMocker.mock('@/data', () => ({
      teamRepo: mockTeamRepo
    }))
  })

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('makes the team active and returns it with all teams', async () => {
    const result = await switchTeam(USER_1, TEAM_2)

    expect(mockTeamRepo.markMemberLastActive).toHaveBeenCalledWith(
      USER_1,
      TEAM_2
    )
    expect(result).toEqual({
      team: {
        id: TEAM_2,
        name: 'Globex',
        position: null,
        permissions: [Permission.ViewTeams]
      },
      teams: [
        { id: TEAM_2, name: 'Globex', position: null },
        { id: TEAM_1, name: 'Acme', position: 'Developer' }
      ]
    })
  })

  it('throws Forbidden when user is not a team member', async () => {
    mockTeamRepo.markMemberLastActive.mockImplementation(async () => undefined)

    expect(switchTeam(USER_1, TEAM_2)).rejects.toMatchObject({
      code: ErrorCode.Forbidden
    })
  })
})
