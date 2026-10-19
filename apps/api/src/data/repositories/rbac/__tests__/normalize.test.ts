import { describe, expect, it } from 'bun:test'

import { Action, Resource } from '@/types'

import type { PermissionRecord } from '../types'

import {
  collapsePermissions,
  expandPermissions,
  splitPermissions
} from '../normalize'

describe('normalize', () => {
  describe('collapsePermissions', () => {
    it('returns empty object for empty input', () => {
      expect(collapsePermissions({})).toEqual({})
    })

    it('collapses view and manage to manage only', () => {
      const result = collapsePermissions({
        [Resource.Users]: { [Action.View]: true, [Action.Manage]: true }
      })

      expect(result).toEqual({ [Resource.Users]: { [Action.Manage]: true } })
    })

    it('keeps resources without manage unchanged', () => {
      const permissions = {
        [Resource.Users]: { [Action.View]: true, [Action.Manage]: false },
        [Resource.Teams]: { [Action.View]: false, [Action.Manage]: false }
      }

      expect(collapsePermissions(permissions)).toEqual(permissions)
    })
  })

  describe('expandPermissions', () => {
    it('returns empty array for empty rows', () => {
      expect(expandPermissions([])).toEqual([])
    })

    it('derives view row for each manage row', () => {
      const result = expandPermissions([
        { action: Action.Manage, resource: Resource.Users },
        { action: Action.View, resource: Resource.Teams }
      ])

      expect(result).toEqual([
        { action: Action.Manage, resource: Resource.Users },
        { action: Action.View, resource: Resource.Teams },
        { action: Action.View, resource: Resource.Users }
      ])
    })
  })

  describe('splitPermissions', () => {
    const allPermissions: PermissionRecord[] = [
      { id: 1, action: Action.View, resource: Resource.Users },
      { id: 2, action: Action.Manage, resource: Resource.Users },
      { id: 3, action: Action.View, resource: Resource.Teams },
      { id: 4, action: Action.Manage, resource: Resource.Teams }
    ]

    it('returns empty ids when there are no permissions', () => {
      expect(splitPermissions({}, [])).toEqual({ grantIds: [], revokeIds: [] })
    })

    it('revokes all permissions for empty request', () => {
      expect(splitPermissions({}, allPermissions)).toEqual({
        grantIds: [],
        revokeIds: [1, 2, 3, 4]
      })
    })

    it('grants requested permissions and revokes false or missing ones', () => {
      const result = splitPermissions(
        { [Resource.Users]: { [Action.View]: true, [Action.Manage]: false } },
        allPermissions
      )

      expect(result).toEqual({ grantIds: [1], revokeIds: [2, 3, 4] })
    })

    it('grants manage only when view and manage are requested', () => {
      const result = splitPermissions(
        { [Resource.Users]: { [Action.View]: true, [Action.Manage]: true } },
        allPermissions
      )

      expect(result).toEqual({ grantIds: [2], revokeIds: [1, 3, 4] })
    })
  })
})
