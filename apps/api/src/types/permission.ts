import Action from './action'
import Resource from './resource'

export type PermissionMap<
  R extends Resource = Exclude<Resource, Resource.Admins>
> = Partial<Record<R, Partial<Record<Action, boolean>>>>

export type PermissionsInput = PermissionMap<Resource>

enum Permission {
  ViewDashboard = 'view:dashboard',
  ViewUsers = 'view:users',
  ViewTeams = 'view:teams',
  ViewAdmins = 'view:admins',
  ViewSystem = 'view:system',
  ManageDashboard = 'manage:dashboard',
  ManageUsers = 'manage:users',
  ManageTeams = 'manage:teams',
  ManageAdmins = 'manage:admins',
  ManageSystem = 'manage:system'
}

// All-false skeleton merged with stored permissions so frontend always gets a full map
export const getAdminBasePermissions = (): PermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.Users]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.Teams]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.System]: { [Action.View]: false, [Action.Manage]: false }
})

// Granted to an admin on creation
export const getAdminDefaultPermissions = (): PermissionMap => ({
  ...getAdminBasePermissions(),
  [Resource.Dashboard]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Users]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
})

// Granted to a user on signup
export const getUserDefaultPermissions = (): PermissionsInput => ({
  [Resource.Dashboard]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
})

// All-false skeleton merged with stored permissions so frontend always gets a full map
export const getMemberBasePermissions = (): PermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: false },
  [Resource.Teams]: { [Action.View]: false }
})

// Granted to a team member on creation
export const getMemberDefaultPermissions = (): PermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: true },
  [Resource.Teams]: { [Action.View]: true }
})

// Every team member permission, granted to the team creator
export const getMemberFullPermissions = (): PermissionsInput => ({
  [Resource.Dashboard]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
})

export default Permission
