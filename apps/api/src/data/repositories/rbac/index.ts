import {
  assignRole,
  grantInitialUserPermissions,
  setUserPermissions
} from './mutations'
import {
  findAllPermissions,
  findInviters,
  findRole,
  findUserPermissions
} from './queries'

export { expandPermissions, splitPermissions } from './normalize'
export { createPermissionLinks } from './permission-links'
export * from './types'

export const rbacRepo = {
  assignRole,
  findAllPermissions,
  findInviters,
  findRole,
  findUserPermissions,
  grantInitialUserPermissions,
  setUserPermissions
}
