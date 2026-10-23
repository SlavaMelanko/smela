import type { MembershipStatus } from '@/types'

import type { membershipsTable, teamsTable } from '../../schema'
import type { PaginatedResult } from '../pagination'

// Database types
export type TeamRecord = typeof teamsTable.$inferSelect
export type MembershipRecord = typeof membershipsTable.$inferSelect

// Input types for create / update / delete / etc
export type CreateTeamInput = typeof teamsTable.$inferInsert
export type UpdateTeamInput = Partial<Omit<CreateTeamInput, 'id' | 'createdAt'>>
export type CreateMembershipInput = typeof membershipsTable.$inferInsert

// Public-facing / API-return types
export type Team = TeamRecord
export type Membership = MembershipRecord

// A null nickname means an admin. A null id means the user is not an active teammate
export interface TeammateRef {
  id: string | null
  nickname: string | null
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
  inviter: TeammateRef | null
  joinedAt: Date | null
}

export type TeamWithMemberCount = Omit<Team, 'createdBy'> & {
  memberCount: number
  creator: TeammateRef | null
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
