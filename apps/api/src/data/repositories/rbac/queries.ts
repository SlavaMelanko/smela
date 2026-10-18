import { eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import type { Database } from '../../clients'
import type { ActivePermissionRow, Inviter, UserRoleRecord } from './types'

import { db } from '../../clients'
import {
  permissionsTable,
  userPermissionsTable,
  userRoleTable,
  usersTable
} from '../../schema'
import { collapsePermissions, expandPermissions } from './normalize'

export const findAllPermissions = async (
  tx?: Database
): Promise<(typeof permissionsTable.$inferSelect)[]> => {
  return (tx || db).select().from(permissionsTable)
}

// Splits the catalog into permission ids to grant and to revoke
export const splitPermissionIds = async (
  permissions: PermissionsInput,
  tx?: Database
) => {
  const normalized = collapsePermissions(permissions)
  const allPerms = await findAllPermissions(tx)

  const isGranted = (p: (typeof allPerms)[number]) =>
    normalized[p.resource]?.[p.action] === true

  return {
    grantIds: allPerms.filter(isGranted).map(p => p.id),
    revokeIds: allPerms.filter(p => !isGranted(p)).map(p => p.id)
  }
}

export const findUserPermissions = async (
  userId: string,
  tx?: Database
): Promise<ActivePermissionRow[]> => {
  const rows = await (tx || db)
    .select({
      action: permissionsTable.action,
      resource: permissionsTable.resource
    })
    .from(userPermissionsTable)
    .innerJoin(
      permissionsTable,
      eq(permissionsTable.id, userPermissionsTable.permissionId)
    )
    .where(eq(userPermissionsTable.userId, userId))

  return expandPermissions(rows)
}

export const findRole = async (
  userId: string,
  tx?: Database
): Promise<UserRoleRecord | undefined> => {
  const executor = tx || db

  const [found] = await executor
    .select()
    .from(userRoleTable)
    .where(eq(userRoleTable.userId, userId))

  return found
}

export const findInviters = async (
  userIds: string[],
  tx?: Database
): Promise<Map<string, Inviter>> => {
  if (userIds.length === 0) {
    return new Map()
  }

  const executor = tx || db
  const rows = await executor
    .select({
      userId: userRoleTable.userId,
      inviterId: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName
    })
    .from(userRoleTable)
    .innerJoin(usersTable, eq(userRoleTable.invitedBy, usersTable.id))
    .where(inArray(userRoleTable.userId, userIds))

  return new Map(
    rows.map(r => [
      r.userId,
      {
        id: r.inviterId,
        firstName: r.firstName,
        lastName: r.lastName
      }
    ])
  )
}
