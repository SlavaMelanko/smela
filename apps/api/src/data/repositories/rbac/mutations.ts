import { and, eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import type { Database } from '../../clients'
import type { CreateUserRoleInput, UserRoleRecord } from './types'

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

export const setUserPermissions = async (
  userId: string,
  permissions: PermissionsInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db
  const allPermissions = await findAllPermissions(tx)
  const { grantIds, revokeIds } = splitPermissions(permissions, allPermissions)

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
