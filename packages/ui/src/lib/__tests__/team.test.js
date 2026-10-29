import { Role } from '@ui/lib/types'

import { canLeaveTeam } from '../team'

describe('canLeaveTeam', () => {
  const member = { id: '1', role: Role.User }
  const creator = { id: '2' }

  it('allows a regular member to leave', () => {
    expect(canLeaveTeam(member, creator)).toBe(true)
  })

  it('forbids the creator to leave', () => {
    expect(canLeaveTeam(member, { id: member.id })).toBe(false)
  })

  it('forbids leaving while the creator is unknown', () => {
    expect(canLeaveTeam(member, undefined)).toBe(false)
  })

  it('forbids admins to leave', () => {
    expect(canLeaveTeam({ ...member, role: Role.Admin }, creator)).toBe(false)
  })
})
