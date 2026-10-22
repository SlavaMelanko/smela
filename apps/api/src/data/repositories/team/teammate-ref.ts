import type { AnyPgColumn, PgSelect } from 'drizzle-orm/pg-core'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { MembershipStatus, Role } from '@/types'

import type { TeammateRef } from './types'

import { teamMembersTable, userRoleTable, usersTable } from '../../schema'

/**
 * Exposes a user related to a team (creator, inviter) without leaking admins.
 * Admins get no nickname and no id. Only active teammates get an id,
 * so a profile link never leads to a 404
 */
export const createTeammateRef = (name: string) => {
  const users = alias(usersTable, name)
  const roles = alias(userRoleTable, `${name}_roles`)
  const memberships = alias(teamMembersTable, `${name}_memberships`)

  const isAdmin = inArray(roles.role, [Role.Admin, Role.Owner])
  const isActiveTeammate = eq(memberships.status, MembershipStatus.Active)

  const fields = {
    exists: sql<boolean>`${users.id} IS NOT NULL`,
    id: sql<string | null>`CASE
      WHEN ${isAdmin} THEN NULL
      WHEN ${isActiveTeammate} THEN ${users.id}
    END`,
    nickname: sql<string | null>`CASE
      WHEN ${isAdmin} THEN NULL
      ELSE ${users.nickname}
    END`
  }

  const join = <T extends PgSelect>(
    query: T,
    userId: AnyPgColumn,
    teamId: AnyPgColumn
  ) =>
    query
      .leftJoin(users, eq(userId, users.id))
      .leftJoin(roles, eq(roles.userId, users.id))
      .leftJoin(
        memberships,
        and(eq(memberships.teamId, teamId), eq(memberships.userId, users.id))
      )

  return { fields, join }
}

interface TeammateRefRow {
  exists: boolean
  id: string | null
  nickname: string | null
}

// Drizzle may return the whole nested object as null after a left join
export const toTeammateRef = (
  row: TeammateRefRow | null
): TeammateRef | null =>
  row?.exists ? { id: row.id, nickname: row.nickname } : null
