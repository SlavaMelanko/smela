import Action from './action'
import Resource from './resource'

/** Parsed API input shape for permission assignments. Actions are fixed to `view`/`manage`. */
export type PermissionsInput = Partial<
  Record<Resource, { view: boolean; manage: boolean }>
>

/** Internal domain representation. Actions are typed by the `Action` enum, each optional. */
export type PermissionMap = Partial<
  Record<Resource, Partial<Record<Action, boolean>>>
>
export type AdminPermissionMap = Omit<
  Record<Resource, Record<Action, boolean>>,
  Resource.Admins
>

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

// All resources and actions an admin can have, all set to false.
// Used as a baseline before merging stored permissions so frontend always gets a full map
export const getAdminBasePermissions = (): AdminPermissionMap => ({
  [Resource.Dashboard]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.Users]: { [Action.View]: false, [Action.Manage]: false },
  [Resource.Teams]: { [Action.View]: false, [Action.Manage]: false }
})

export const getAdminDefaultPermissions = (): AdminPermissionMap => ({
  ...getAdminBasePermissions(),
  [Resource.Dashboard]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Users]: { [Action.View]: true, [Action.Manage]: true },
  [Resource.Teams]: { [Action.View]: true, [Action.Manage]: true }
})

export const getMemberDefaultPermissions = () => ({
  [Resource.Dashboard]: { [Action.View]: true },
  [Resource.Teams]: { [Action.View]: true }
})

export default Permission
