import Action from './action'
import Resource from './resource'

export type PermissionsInput = Partial<
  Record<Resource, { view: boolean; manage: boolean }>
>

export type PermissionMap<
  R extends Resource = Exclude<Resource, Resource.Admins>
> = Partial<Record<R, Partial<Record<Action, boolean>>>>

enum Permission {
  ViewDashboard = 'view:dashboard',
  ViewUsers = 'view:users',
  ViewTeams = 'view:teams',
  ViewAdmins = 'view:admins',
  ManageDashboard = 'manage:dashboard',
  ManageUsers = 'manage:users',
  ManageTeams = 'manage:teams',
  ManageAdmins = 'manage:admins'
}

// Base: all-false skeleton merged with stored permissions so frontend always gets a full map.
// Default: permissions granted on creation.
export const getAdminBasePermissions = (): PermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.Users]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.Teams]: { [Action.View]: false, [Action.Manage]: false }
})

export const getAdminDefaultPermissions = (): PermissionMap => ({
  ...getAdminBasePermissions(),
  [Resource.Dashboard]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Users]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
})

// Base: all-false skeleton merged with stored permissions so frontend always gets a full map.
// Default: permissions granted on creation.
export const getMemberBasePermissions = (): PermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: false },
  [Resource.Teams]: { [Action.View]: false }
})

export const getMemberDefaultPermissions = (): PermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: true },
  [Resource.Teams]: { [Action.View]: true }
})

export default Permission
