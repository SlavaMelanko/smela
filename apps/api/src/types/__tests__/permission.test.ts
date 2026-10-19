import { describe, expect, it } from 'bun:test'

import {
  getAdminDefaultPermissions,
  getMemberDefaultPermissions,
  getMemberFullPermissions,
  getUserDefaultPermissions
} from '../permission'
import Resource from '../resource'

describe('getAdminDefaultPermissions', () => {
  it('grants view and manage for users', () => {
    const permissions = getAdminDefaultPermissions()

    expect(permissions[Resource.Users]).toEqual({ view: true, manage: true })
  })

  it('grants view and manage for teams', () => {
    const permissions = getAdminDefaultPermissions()

    expect(permissions[Resource.Teams]).toEqual({ view: true, manage: true })
  })

  it('grants view and manage for dashboard', () => {
    const permissions = getAdminDefaultPermissions()

    expect(permissions[Resource.Dashboard]).toEqual({
      view: true,
      manage: true
    })
  })

  it('covers all expected resources', () => {
    const permissions = getAdminDefaultPermissions()

    expect(Object.keys(permissions)).toContain(Resource.Users)
    expect(Object.keys(permissions)).toContain(Resource.Teams)
    expect(Object.keys(permissions)).toContain(Resource.Dashboard)
  })
})

describe('getMemberDefaultPermissions', () => {
  it('grants view but not manage for teams only', () => {
    expect(getMemberDefaultPermissions()).toEqual({
      [Resource.Teams]: { view: true }
    })
  })
})

describe('getMemberFullPermissions', () => {
  it('grants view and manage for teams only', () => {
    expect(getMemberFullPermissions()).toEqual({
      [Resource.Teams]: { view: true, manage: true }
    })
  })
})

describe('getUserDefaultPermissions', () => {
  it('grants dashboard only, since team permissions live on the membership', () => {
    expect(getUserDefaultPermissions()).toEqual({
      [Resource.Dashboard]: { view: true, manage: true }
    })
  })
})
