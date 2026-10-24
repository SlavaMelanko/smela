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
  UserTeamInfo,
  UserTeamInvite
} from './types'

import { db } from '../../clients'
import {
  membershipPermissionsTable,
  membershipsTable,
  permissionsTable,
  refreshTokensTable,
  teamsTable,
  usersTable
} from '../../schema'
import { buildPagination, calcOffset } from '../pagination'
import { expandPermissions } from '../rbac'
import { createTeammateRef, toTeammateRef } from './teammate-ref'

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
  // hits memberships_team_index exactly N times (N = page size)
  const memberCountSubquery = sql<number>`(
    SELECT COUNT(*)::int
    FROM ${membershipsTable}
    WHERE ${membershipsTable.teamId} = ${sql.raw('"teams"."id"')}
  )`

  const creator = createTeammateRef('creators')

  const teamsQuery = executor
    .select({
      id: teamsTable.id,
      name: teamsTable.name,
      website: teamsTable.website,
      description: teamsTable.description,
      createdAt: teamsTable.createdAt,
      updatedAt: teamsTable.updatedAt,
      memberCount: memberCountSubquery,
      creator: creator.fields
    })
    .from(teamsTable)
    .$dynamic()

  const [rows, countResult] = await Promise.all([
    creator
      .join(teamsQuery, teamsTable.createdBy, teamsTable.id)
      .where(whereClause)
      .orderBy(desc(teamsTable.createdAt))
      .limit(pagination.limit)
      .offset(calcOffset(pagination)),
    executor.select({ value: count() }).from(teamsTable).where(whereClause)
  ])

  const teams = rows.map(row => ({
    ...row,
    creator: toTeammateRef(row.creator)
  }))

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
  const inviter = createTeammateRef('inviters')

  const whereConditions = [eq(membershipsTable.teamId, teamId)]
  if (userId) {
    whereConditions.push(eq(membershipsTable.userId, userId))
  }

  const membersQuery = executor
    .select({
      id: membershipsTable.userId,
      membershipId: membershipsTable.id,
      nickname: usersTable.nickname,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      status: membershipsTable.status,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      lastActive: sql<Date | null>`(
        SELECT MAX(${refreshTokensTable.createdAt})
        FROM ${refreshTokensTable}
        WHERE ${refreshTokensTable.userId} = ${membershipsTable.userId}
      )`,
      position: membershipsTable.position,
      joinedAt: membershipsTable.joinedAt,
      inviter: inviter.fields
    })
    .from(membershipsTable)
    .innerJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
    .$dynamic()

  const rows = await inviter
    .join(membersQuery, membershipsTable.invitedBy, membershipsTable.teamId)
    .where(and(...whereConditions))
    .orderBy(desc(membershipsTable.joinedAt))

  return rows.map(row => ({ ...row, inviter: toTeammateRef(row.inviter) }))
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
      membershipId: membershipsTable.id,
      name: teamsTable.name,
      position: membershipsTable.position
    })
    .from(membershipsTable)
    .innerJoin(teamsTable, eq(membershipsTable.teamId, teamsTable.id))
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.status, MembershipStatus.Active)
      )
    )
    .orderBy(desc(membershipsTable.lastActiveAt))
}

// Pending memberships, newest invite first. Until accepted, joinedAt holds the invite time
export const findUserInvites = async (
  userId: string,
  tx?: Database
): Promise<UserTeamInvite[]> => {
  const executor = tx || db
  const invitersTable = alias(usersTable, 'inviters')

  return executor
    .select({
      id: teamsTable.id,
      name: teamsTable.name,
      inviter: {
        nickname: invitersTable.nickname,
        firstName: invitersTable.firstName,
        lastName: invitersTable.lastName
      }
    })
    .from(membershipsTable)
    .innerJoin(teamsTable, eq(membershipsTable.teamId, teamsTable.id))
    .leftJoin(invitersTable, eq(membershipsTable.invitedBy, invitersTable.id))
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.status, MembershipStatus.Pending)
      )
    )
    .orderBy(desc(membershipsTable.joinedAt))
}

export const findMembershipPermissions = async (
  membershipId: string,
  tx?: Database
): Promise<ActivePermissionRow[]> => {
  const rows = await (tx || db)
    .select({
      action: permissionsTable.action,
      resource: permissionsTable.resource
    })
    .from(membershipPermissionsTable)
    .innerJoin(
      permissionsTable,
      eq(permissionsTable.id, membershipPermissionsTable.permissionId)
    )
    .where(eq(membershipPermissionsTable.membershipId, membershipId))

  return expandPermissions(rows)
}

// Lock both records so creator protection and the following write use the same database state
export const lockMembership = async (
  teamId: string,
  userId: string,
  tx: Database
) => {
  const [member] = await tx
    .select({
      membershipId: membershipsTable.id,
      userId: membershipsTable.userId,
      status: membershipsTable.status,
      createdBy: teamsTable.createdBy
    })
    .from(membershipsTable)
    .innerJoin(teamsTable, eq(teamsTable.id, membershipsTable.teamId))
    .where(
      and(
        eq(membershipsTable.teamId, teamId),
        eq(membershipsTable.userId, userId)
      )
    )
    .for('update', { of: [teamsTable, membershipsTable] })

  return member
}
