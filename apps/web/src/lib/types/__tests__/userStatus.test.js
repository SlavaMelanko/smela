import { getStatusBgColor, getStatusTextColor } from '@/components/UserStatus'

import {
  adminActiveStatuses,
  allUserStatuses,
  userActiveStatuses,
  UserStatus
} from '../userStatus'

describe('userActiveStatuses', () => {
  it('contains expected statuses', () => {
    expect(userActiveStatuses).toContain(UserStatus.Verified)
    expect(userActiveStatuses).toContain(UserStatus.Trial)
    expect(userActiveStatuses).toContain(UserStatus.Active)
    expect(userActiveStatuses).toHaveLength(3)
  })
})

describe('adminActiveStatuses', () => {
  it('contains only ACTIVE', () => {
    expect(adminActiveStatuses).toEqual([UserStatus.Active])
    expect(adminActiveStatuses).toHaveLength(1)
  })
})

describe('getStatusBgColor', () => {
  it.each(allUserStatuses)('returns bg class for %s', status => {
    expect(getStatusBgColor(status)).toMatch(/^bg-/)
  })

  it('returns fallback for unknown status', () => {
    expect(getStatusBgColor('unknown')).toBe('bg-muted-foreground')
  })
})

describe('getStatusTextColor', () => {
  it.each(allUserStatuses)('returns text class for %s', status => {
    expect(getStatusTextColor(status)).toMatch(/^text-/)
  })

  it('returns fallback for unknown status', () => {
    expect(getStatusTextColor('unknown')).toBe('text-muted-foreground')
  })
})
