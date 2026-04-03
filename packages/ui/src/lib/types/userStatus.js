// Cross-references: public/locales/*.json
export const UserStatus = {
  New: 'new',
  Verified: 'verified',
  Trial: 'trial',
  Active: 'active',
  Suspended: 'suspended',
  Archived: 'archived',
  Pending: 'pending'
}

export const allUserStatuses = Object.values(UserStatus)

export const userActiveStatuses = [
  UserStatus.Verified,
  UserStatus.Trial,
  UserStatus.Active
]

export const adminActiveStatuses = [UserStatus.Active]
