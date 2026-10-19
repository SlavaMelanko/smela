import type { PermissionsInput } from '@/types'

import { Action, Resource } from '@/types'

import type { ActivePermissionRow, PermissionRecord } from './types'

export type NormalizedPermissions = Partial<
  Record<Resource, { view?: boolean; manage: boolean }>
>

// Before writing: collapse view + manage → manage only, since manage implies view.
// The DB never stores a view row next to manage for the same resource.
// Before: { users: { view: true, manage: true } }
// After: { users: { manage: true } }
export const collapsePermissions = (
  permissions: PermissionsInput
): NormalizedPermissions => {
  const result: NormalizedPermissions = { ...permissions }

  for (const resource of Object.values(Resource)) {
    const perms = result[resource]
    if (perms?.[Action.View] === true && perms?.[Action.Manage] === true) {
      result[resource] = { [Action.Manage]: true }
    }
  }

  return result
}

// After reading: expand manage → derive synthetic view rows, since manage implies view.
// Callers above the repository always see both view and manage.
// Before: [{ action: 'manage', resource: 'users' }]
// After: [{ action: 'manage', resource: 'users' }, { action: 'view', resource: 'users' }]
export const expandPermissions = (
  rows: ActivePermissionRow[]
): ActivePermissionRow[] => {
  const derived: ActivePermissionRow[] = rows
    .filter(r => r.action === Action.Manage)
    .map(r => ({ action: Action.View, resource: r.resource }))

  return [...rows, ...derived]
}

// Before writing: split all permissions into ids to grant and to revoke.
// Missing or false requested permissions are revoked.
// Before: requested { users: { view: true } }, all [{ id: 1, users:view }, { id: 2, users:manage }]
// After: { grantIds: [1], revokeIds: [2] }
export const splitPermissions = (
  requestedPermissions: PermissionsInput,
  allPermissions: PermissionRecord[]
) => {
  const normalized = collapsePermissions(requestedPermissions)

  const isGranted = (p: PermissionRecord) =>
    normalized[p.resource]?.[p.action] === true

  return {
    grantIds: allPermissions.filter(isGranted).map(p => p.id),
    revokeIds: allPermissions.filter(p => !isGranted(p)).map(p => p.id)
  }
}
