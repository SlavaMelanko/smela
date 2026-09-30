import { mock } from 'bun:test'

import type { TeamMemberDetails, teamRepo, TeamWithMemberCount } from '@/data'

import { UserStatus } from '@/types'

// Valid for z.uuid(), unlike testUuids.TEAM_1 (invalid variant nibble)
export const TEST_TEAM_ID = '00000000-0000-4000-a0c0-000000000001'

export const buildTeam = (
  overrides: Partial<TeamWithMemberCount> = {}
): TeamWithMemberCount => ({
  id: TEST_TEAM_ID,
  name: 'Engineering',
  website: 'https://example.com',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  memberCount: 1,
  ...overrides
})

export const buildTeamMember = (id: string): TeamMemberDetails => ({
  id,
  firstName: 'Alice',
  lastName: null,
  email: 'alice@example.com',
  status: UserStatus.Active,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActive: null,
  position: null,
  inviter: null,
  joinedAt: null
})

// Covers the teamRepo calls made by the team-access guard
export const createTeamAccessRepoMock = (team: TeamWithMemberCount) =>
  ({
    find: mock(async (): Promise<TeamWithMemberCount | undefined> => team),
    findMember: mock(
      async (
        _teamId: string,
        memberId: string
      ): Promise<TeamMemberDetails | undefined> => buildTeamMember(memberId)
    )
  }) satisfies Partial<typeof teamRepo>
