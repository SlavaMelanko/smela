import { assignRole, setUserPermissions } from './mutations'
import {
  findAllPermissions,
  findInviters,
  findRole,
  findUserPermissions
} from './queries'

export { expandPermissions, splitPermissions } from './normalize'
export * from './types'

export const rbacRepo = {
  assignRole,
  findAllPermissions,
  findInviters,
  findRole,
  findUserPermissions,
  setUserPermissions
}
