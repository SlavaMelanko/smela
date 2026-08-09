import { UserStatus } from '@smela/contracts'

export const isActive = (status: UserStatus) =>
  status === UserStatus.Verified ||
  status === UserStatus.Trial ||
  status === UserStatus.Active

export const isNewOrActive = (status: UserStatus) =>
  status === UserStatus.New || isActive(status)

export const isActiveOnly = (status: UserStatus) => status === UserStatus.Active

export default UserStatus
