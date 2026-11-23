import type { AnyPgColumn, PgInsertValue, PgTable } from 'drizzle-orm/pg-core'

import { and, eq, inArray } from 'drizzle-orm'

import type { PermissionsInput } from '@/types'

import type { Database } from '../../clients'

import { db } from '../../clients'
import { splitPermissions } from './normalize'
import { findAllPermissions } from './queries'

type PermissionLinksTable = PgTable & { permissionId: AnyPgColumn }

/**
 * Writes permission links for one owner (user or membership).
 * grantInitial only inserts, so it suits a new owner with no links yet.
 * set also revokes links, so it suits editing an existing owner
 */
export const createPermissionLinks = <T extends PermissionLinksTable>(
  table: T,
  ownerColumn: AnyPgColumn,
  toRow: (ownerId: string, permissionId: number) => PgInsertValue<T>
) => {
  const split = async (permissions: PermissionsInput, tx?: Database) =>
    splitPermissions(permissions, await findAllPermissions(tx))

  const insert = async (
    ownerId: string,
    permissionIds: number[],
    executor: Database
  ) => {
    if (permissionIds.length === 0) {
      return
    }

    await executor
      .insert(table)
      .values(permissionIds.map(permissionId => toRow(ownerId, permissionId)))
      .onConflictDoNothing()
  }

  const remove = async (
    ownerId: string,
    permissionIds: number[],
    executor: Database
  ) => {
    if (permissionIds.length === 0) {
      return
    }

    await executor
      .delete(table)
      .where(
        and(
          eq(ownerColumn, ownerId),
          inArray(table.permissionId, permissionIds)
        )
      )
  }

  const grantInitial = async (
    ownerId: string,
    permissions: PermissionsInput,
    tx?: Database
  ): Promise<void> => {
    const { grantIds } = await split(permissions, tx)

    await insert(ownerId, grantIds, tx || db)
  }

  const set = async (
    ownerId: string,
    permissions: PermissionsInput,
    tx?: Database
  ): Promise<void> => {
    const executor = tx || db
    const { grantIds, revokeIds } = await split(permissions, tx)

    await Promise.all([
      insert(ownerId, grantIds, executor),
      remove(ownerId, revokeIds, executor)
    ])
  }

  return { grantInitial, set }
}
