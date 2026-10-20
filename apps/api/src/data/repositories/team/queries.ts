import { and, count, desc, eq, inArray, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { MembershipStatus } from '@/types'

import type { Database } from '../../clients'
import type { PaginationParams } from '../pagination'
import type { ActivePermissionRow } from '../rbac'
import type {
  Team,
  TeamMemberDetails,
  TeamSearchParams,
  TeamSearchResult,
  TeamWithMemberCount,
  UserTeamInfo
} from './types'

import { db } from '../../clients'
import {
  permissionsTable,
  refreshTokensTable,
  teamMemberPermissionsTable,
  teamMembersTable,
  teamsTable,
  usersTable
} from '../../schema'
import { buildPagination, calcOffset } from '../pagination'
import { expandPermissions } from '../rbac'

const buildWhereConditions = ({ ids, search }: TeamSearchParams) => {
  const conditions = []

  if (ids && ids.length > 0) {
    conditions.push(inArray(teamsTable.id, ids))
  }

  if (search && search.length > 0) {
    // Use concatenated expression to leverage GIN index (idx_teams_search_trgm)
    conditions.push(
      sql`(${teamsTable.id}::text || ' ' || ${teamsTable.name} || ' ' || COALESCE(${teamsTable.website}, '') || ' ' || COALESCE(${teamsTable.description}, '')) ILIKE ${`%${search}%`}`
    )
  }

  return and(...conditions)
}

export const searchTeams = async (
  filters: TeamSearchParams,
  pagination: PaginationParams,
  tx?: Database
): Promise<TeamSearchResult> => {
  const executor = tx || db

  const whereClause = buildWhereConditions(filters)

  // Correlated subquery — executes once per returned row,
  // hits team_members_team_index exactly N times (N = page size)
  const memberCountSubquery = sql<number>`(
    SELECT COUNT(*)::int
    FROM ${teamMembersTable}
    WHERE ${teamMembersTable.teamId} = ${sql.raw('"teams"."id"')}
  )`

  const [teams, countResult] = await Promise.all([
    executor
      .select({
        id: teamsTable.id,
        name: teamsTable.name,
        website: teamsTable.website,
        description: teamsTable.description,
        createdBy: teamsTable.createdBy,
        createdAt: teamsTable.createdAt,
        updatedAt: teamsTable.updatedAt,
        memberCount: memberCountSubquery
      })
      .from(teamsTable)
      .where(whereClause)
      .orderBy(desc(teamsTable.createdAt))
      .limit(pagination.limit)
      .offset(calcOffset(pagination)),
    executor.select({ value: count() }).from(teamsTable).where(whereClause)
  ])

  return {
    teams,
    pagination: buildPagination(pagination, countResult)
  }
}

export const findTeam = async (
  teamId: string,
  tx?: Database
): Promise<TeamWithMemberCount | undefined> => {
  const result = await searchTeams({ ids: [teamId] }, { page: 1, limit: 1 }, tx)

  return result.teams[0]
}

export const findTeamById = async (
  teamId: string,
  tx?: Database
): Promise<Team | undefined> => {
  const executor = tx || db

  const [team] = await executor
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, teamId))

  return team
}

/**
 * Gets all team members or a single member if userId is specified
 */
export const findTeamMembers = async (
  teamId: string,
  userId?: string,
  tx?: Database
): Promise<TeamMemberDetails[]> => {
  const executor = tx || db
  const invitersTable = alias(usersTable, 'inviters')

  const whereConditions = [eq(teamMembersTable.teamId, teamId)]
  if (userId) {
    whereConditions.push(eq(teamMembersTable.userId, userId))
  }

  const rows = await executor
    .select({
      id: teamMembersTable.userId,
      membershipId: teamMembersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      status: teamMembersTable.status,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      lastActive: sql<Date | null>`(
        SELECT MAX(${refreshTokensTable.createdAt})
        FROM ${refreshTokensTable}
        WHERE ${refreshTokensTable.userId} = ${teamMembersTable.userId}
      )`,
      position: teamMembersTable.position,
      joinedAt: teamMembersTable.joinedAt,
      inviter: {
        id: invitersTable.id,
        firstName: invitersTable.firstName,
        lastName: invitersTable.lastName
      }
    })
    .from(teamMembersTable)
    .innerJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
    .leftJoin(invitersTable, eq(teamMembersTable.invitedBy, invitersTable.id))
    .where(and(...whereConditions))
    .orderBy(desc(teamMembersTable.joinedAt))

  return rows
}

export const findTeamMember = async (
  teamId: string,
  userId: string,
  tx?: Database
): Promise<TeamMemberDetails | undefined> => {
  const members = await findTeamMembers(teamId, userId, tx)

  return members[0]
}

// Active memberships only, most recently active first,
// so the first one is the user's active team
export const findUserTeams = async (
  userId: string,
  tx?: Database
): Promise<UserTeamInfo[]> => {
  const executor = tx || db

  return executor
    .select({
      id: teamsTable.id,
      membershipId: teamMembersTable.id,
      name: teamsTable.name,
      position: teamMembersTable.position
    })
    .from(teamMembersTable)
    .innerJoin(teamsTable, eq(teamMembersTable.teamId, teamsTable.id))
    .where(
      and(
        eq(teamMembersTable.userId, userId),
        eq(teamMembersTable.status, MembershipStatus.Active)
      )
    )
    .orderBy(desc(teamMembersTable.lastActiveAt))
}

export const findTeamMemberPermissions = async (
  membershipId: string,
  tx?: Database
): Promise<ActivePermissionRow[]> => {
  const rows = await (tx || db)
    .select({
      action: permissionsTable.action,
      resource: permissionsTable.resource
    })
    .from(teamMemberPermissionsTable)
    .innerJoin(
      permissionsTable,
      eq(permissionsTable.id, teamMemberPermissionsTable.permissionId)
    )
    .where(eq(teamMemberPermissionsTable.memberId, membershipId))

  return expandPermissions(rows)
}
