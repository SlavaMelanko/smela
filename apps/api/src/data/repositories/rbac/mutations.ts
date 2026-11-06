import { and, eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import type { Database } from '../../clients'
import type {
  CreateUserRoleInput,
  PermissionRecord,
  UserRoleRecord
} from './types'

import { db } from '../../clients'
import { userPermissionsTable, userRoleTable } from '../../schema'
import { splitPermissions } from './normalize'
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

const insertUserPermissions = async (
  userId: string,
  permissionIds: PermissionRecord['id'][],
  executor: Database
): Promise<void> => {
  if (permissionIds.length === 0) {
    return
  }

  await executor
    .insert(userPermissionsTable)
    .values(permissionIds.map(permissionId => ({ userId, permissionId })))
    .onConflictDoNothing()
}

// Insert-only, for a user created in the same flow: there is nothing to revoke
export const grantUserPermissions = async (
  userId: string,
  permissions: PermissionsInput,
  tx?: Database
): Promise<void> => {
  const allPermissions = await findAllPermissions(tx)
  const { grantIds } = splitPermissions(permissions, allPermissions)

  await insertUserPermissions(userId, grantIds, tx || db)
}

export const setUserPermissions = async (
  userId: string,
  permissions: PermissionsInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db
  const allPermissions = await findAllPermissions(tx)
  const { grantIds, revokeIds } = splitPermissions(permissions, allPermissions)

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

  await Promise.all([
    insertUserPermissions(userId, grantIds, executor),
    revoke()
  ])
}
