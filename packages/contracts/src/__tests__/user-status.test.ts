import { describe, expect, it } from 'bun:test'

import { UserStatus } from '../user-status'

describe('UserStatus', () => {
  it('exposes the expected values', () => {
    expect(UserStatus.New).toBe('new' as UserStatus)
    expect(UserStatus.Verified).toBe('verified' as UserStatus)
    expect(UserStatus.Trial).toBe('trial' as UserStatus)
    expect(UserStatus.Active).toBe('active' as UserStatus)
    expect(UserStatus.Suspended).toBe('suspended' as UserStatus)
    expect(UserStatus.Archived).toBe('archived' as UserStatus)
    expect(UserStatus.Pending).toBe('pending' as UserStatus)
  })
})
