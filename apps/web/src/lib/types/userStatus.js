// Cross-references: public/locales/*.json
export const UserStatus = {
  NEW: 'new',
  VERIFIED: 'verified',
  TRIAL: 'trial',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
  PENDING: 'pending'
}

export const allUserStatuses = Object.values(UserStatus)

export const userActiveStatuses = [
  UserStatus.VERIFIED,
  UserStatus.TRIAL,
  UserStatus.ACTIVE
]

export const adminActiveStatuses = [UserStatus.ACTIVE]
