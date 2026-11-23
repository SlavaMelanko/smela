import type { Database } from '../../clients'
import type { CreateUserRoleInput, UserRoleRecord } from './types'

import { db } from '../../clients'
import { userPermissionsTable, userRoleTable } from '../../schema'
import { createPermissionLinks } from './permission-links'

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

const userPermissionLinks = createPermissionLinks(
  userPermissionsTable,
  userPermissionsTable.userId,
  (userId, permissionId) => ({ userId, permissionId })
)

export const grantInitialUserPermissions = userPermissionLinks.grantInitial
export const setUserPermissions = userPermissionLinks.set
