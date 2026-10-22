import type { MembershipStatus } from '@/types'

import type { teamMembersTable, teamsTable } from '../../schema'
import type { PaginatedResult } from '../pagination'

// Database types
export type TeamRecord = typeof teamsTable.$inferSelect
export type TeamMemberRecord = typeof teamMembersTable.$inferSelect

// Input types for create / update / delete / etc
export type CreateTeamInput = typeof teamsTable.$inferInsert
export type UpdateTeamInput = Partial<Omit<CreateTeamInput, 'id' | 'createdAt'>>
export type CreateTeamMemberInput = typeof teamMembersTable.$inferInsert

// Public-facing / API-return types
export type Team = TeamRecord
export type TeamMember = TeamMemberRecord

export interface TeamMemberInviter {
  id: string | null
  nickname: string | null
  firstName: string | null
  lastName: string | null
}

export interface TeamMemberDetails {
  id: string
  membershipId: string
  nickname: string
  firstName: string | null
  lastName: string | null
  email: string
  status: MembershipStatus
  createdAt: Date
  updatedAt: Date
  lastActive: Date | null
  position: string | null
  inviter: TeamMemberInviter | null
  joinedAt: Date | null
}

// A null nickname means an admin created the team. A null id means the creator is not an active teammate
export interface TeamCreator {
  id: string | null
  nickname: string | null
}

export type TeamWithMemberCount = Omit<Team, 'createdBy'> & {
  memberCount: number
  creator: TeamCreator | null
}

export interface UserTeamInfo {
  id: string
  membershipId: string
  name: string
  position: string | null
}

export interface UserTeamInvite {
  id: string
  name: string
  inviter: {
    nickname: string | null
    firstName: string | null
    lastName: string | null
  } | null
}

export interface TeamSearchParams {
  ids?: string[]
  search?: string
}

export interface TeamSearchResult {
  teams: TeamWithMemberCount[]
  pagination: PaginatedResult
}
