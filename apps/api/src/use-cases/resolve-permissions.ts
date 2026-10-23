import type { ActivePermissionRow } from '@/data'
import type { Permission, PermissionMap, Resource } from '@/types'

import { rbacRepo, teamRepo } from '@/data'

// Maps DB rows to "action:resource" strings, e.g.
// "view:users", "manage:teams" for frontend consumption
const toPermissionList = (rows: ActivePermissionRow[]): Permission[] =>
  rows.map(row => `${row.action}:${row.resource}` as Permission)

export const resolvePermissionList = async (
  userId: string
): Promise<Permission[] | undefined> => {
  const rows = await rbacRepo.findUserPermissions(userId)
  const permissions = toPermissionList(rows)

  return permissions.length > 0 ? permissions : undefined
}

export const resolveMembershipPermissionList = async (
  membershipId: string
): Promise<Permission[]> => {
  const rows = await teamRepo.findMembershipPermissions(membershipId)

  return toPermissionList(rows)
}

// Builds a permission map grouped by resource.
//
// Example:
// {
//   users: { view: true, manage: true },
//   teams: { view: true }
// }
//
// Useful for frontend permission grids where resources are rows
// and actions (view, manage) are toggleable columns.
//
// If a baseline (all-false map) is provided, missing permissions
// will be explicitly set to false:
//
// {
//   users: { view: true, manage: true },
//   teams: { view: true, manage: false }
// }
const toPermissionMap = (
  rows: ActivePermissionRow[],
  baseline?: PermissionMap
): PermissionMap => {
  const result: PermissionMap<Resource> = baseline
    ? structuredClone(baseline)
    : {}

  for (const row of rows) {
    const resource = result[row.resource] ?? {}
    resource[row.action] = true
    result[row.resource] = resource
  }

  return result
}

export const resolvePermissionMap = async (
  userId: string,
  baseline?: PermissionMap
): Promise<PermissionMap> => {
  const rows = await rbacRepo.findUserPermissions(userId)

  return toPermissionMap(rows, baseline)
}

export const resolveMembershipPermissionMap = async (
  membershipId: string,
  baseline?: PermissionMap
): Promise<PermissionMap> => {
  const rows = await teamRepo.findMembershipPermissions(membershipId)

  return toPermissionMap(rows, baseline)
}
