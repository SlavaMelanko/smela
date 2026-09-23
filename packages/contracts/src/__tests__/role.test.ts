import { describe, expect, it } from 'bun:test'

import { Role } from '../role'

describe('Role', () => {
  it('exposes the expected values', () => {
    expect(Role.User).toBe('user' as Role)
    expect(Role.Admin).toBe('admin' as Role)
    expect(Role.Owner).toBe('owner' as Role)
  })
})
