import {
  assignRole,
  setMemberPermissions,
  setUserPermissions
} from './mutations'
import {
  findInviters,
  findMemberPermissions,
  findRole,
  findUserPermissions
} from './queries'

export * from './types'

export const rbacRepo = {
  assignRole,
  findInviters,
  findMemberPermissions,
  findRole,
  findUserPermissions,
  setMemberPermissions,
  setUserPermissions
}
