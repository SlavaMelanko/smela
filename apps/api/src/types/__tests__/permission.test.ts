import { describe, expect, it } from 'bun:test'

import {
  getAdminDefaultPermissions,
  getMemberDefaultPermissions
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
  it('grants view but not manage for teams', () => {
    const permissions = getMemberDefaultPermissions()

    expect(permissions[Resource.Teams]).toEqual({ view: true })
  })

  it('grants view but not manage for dashboard', () => {
    const permissions = getMemberDefaultPermissions()

    expect(permissions[Resource.Dashboard]).toEqual({ view: true })
  })

  it('includes only teams and dashboard resources', () => {
    const permissions = getMemberDefaultPermissions()

    expect(Object.keys(permissions)).toEqual([
      Resource.Dashboard,
      Resource.Teams
    ])
  })
})
