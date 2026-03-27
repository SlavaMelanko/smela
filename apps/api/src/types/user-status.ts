enum UserStatus {
  New = 'new',
  Verified = 'verified',
  Trial = 'trial',
  Active = 'active',
  Suspended = 'suspended',
  Archived = 'archived',
  Pending = 'pending',
}

export const isActive = (status: UserStatus) =>
  status === UserStatus.Verified
  || status === UserStatus.Trial
  || status === UserStatus.Active

export const isNewOrActive = (status: UserStatus) =>
  status === UserStatus.New || isActive(status)

export const isActiveOnly = (status: UserStatus) =>
  status === UserStatus.Active

export default UserStatus
