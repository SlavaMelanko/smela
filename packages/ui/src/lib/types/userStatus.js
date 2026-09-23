import { UserStatus } from '@smela/contracts'

// Cross-references: public/locales/*.json
export { UserStatus }

export const allUserStatuses = Object.values(UserStatus)

export const userActiveStatuses = [
  UserStatus.Verified,
  UserStatus.Trial,
  UserStatus.Active
]

export const adminActiveStatuses = [UserStatus.Active]
