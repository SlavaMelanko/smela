import { assignRole, setUserPermissions } from './mutations'
import { expandPermissions, splitPermissions } from './normalize'
import {
  findAllPermissions,
  findInviters,
  findRole,
  findUserPermissions
} from './queries'

export * from './types'

export { expandPermissions, findAllPermissions, splitPermissions }

export const rbacRepo = {
  assignRole,
  findInviters,
  findRole,
  findUserPermissions,
  setUserPermissions
}
