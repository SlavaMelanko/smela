import { and, eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import type { Database } from '../../clients'
import type { CreateUserRoleInput, UserRoleRecord } from './types'

import { db } from '../../clients'
import {
  teamMemberPermissionsTable,
  userPermissionsTable,
  userRoleTable
} from '../../schema'
import { collapsePermissions } from './normalize'
import { findAllPermissions } from './queries'

export const assignRole = async (
  input: CreateUserRoleInput,
  tx?: Database
): Promise<UserRoleRecord> => {
  const executor = tx || db

  const [created] = await executor
    .insert(userRoleTable)
    .values(input)
    .returning()

  return created
}

// Splits the catalog into permission ids to grant and to revoke
const splitPermissionIds = async (
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

export const setUserPermissions = async (
  userId: string,
  permissions: PermissionsInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db
  const { grantIds, revokeIds } = await splitPermissionIds(permissions, tx)

  const grant = async () => {
    if (grantIds.length === 0) {
      return
    }

    await executor
      .insert(userPermissionsTable)
      .values(grantIds.map(permissionId => ({ userId, permissionId })))
      .onConflictDoNothing()
  }

  const revoke = async () => {
    if (revokeIds.length === 0) {
      return
    }

    await executor
      .delete(userPermissionsTable)
      .where(
        and(
          eq(userPermissionsTable.userId, userId),
          inArray(userPermissionsTable.permissionId, revokeIds)
        )
      )
  }

  await Promise.all([grant(), revoke()])
}

export const setMemberPermissions = async (
  memberId: number,
  permissions: PermissionsInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db
  const { grantIds, revokeIds } = await splitPermissionIds(permissions, tx)

  const grant = async () => {
    if (grantIds.length === 0) {
      return
    }

    await executor
      .insert(teamMemberPermissionsTable)
      .values(grantIds.map(permissionId => ({ memberId, permissionId })))
      .onConflictDoNothing()
  }

  const revoke = async () => {
    if (revokeIds.length === 0) {
      return
    }

    await executor
      .delete(teamMemberPermissionsTable)
      .where(
        and(
          eq(teamMemberPermissionsTable.memberId, memberId),
          inArray(teamMemberPermissionsTable.permissionId, revokeIds)
        )
      )
  }

  await Promise.all([grant(), revoke()])
}
