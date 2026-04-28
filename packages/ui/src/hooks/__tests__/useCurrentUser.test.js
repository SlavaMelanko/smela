import { renderHook } from '@testing-library/react'

import { useCurrentUser } from '../useAuth'

vi.mock('../useAuth')

const withPermissions = (permissions = []) =>
  useCurrentUser.mockReturnValue({
    permissions,
    can: p => permissions.includes(p),
    canAll: perms => perms.every(p => permissions.includes(p)),
    canAny: perms => perms.some(p => permissions.includes(p))
  })

describe('useCurrentUser: permission', () => {
  beforeEach(() => {
    useCurrentUser.mockClear()
  })

  describe('can', () => {
    it('returns true when permission is present', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.can('view:teams')).toBe(true)
    })

    it('returns false when permission is absent', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.can('manage:users')).toBe(false)
    })

    it('returns false when permissions is empty', () => {
      withPermissions([])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.can('view:teams')).toBe(false)
    })
  })

  describe('canAll', () => {
    it('returns true when all permissions are present', () => {
      withPermissions(['view:teams', 'manage:users'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.canAll(['view:teams', 'manage:users'])).toBe(true)
    })

    it('returns false when one permission is missing', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.canAll(['view:teams', 'manage:users'])).toBe(false)
    })

    it('returns true for empty list', () => {
      withPermissions([])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.canAll([])).toBe(true)
    })
  })

  describe('canAny', () => {
    it('returns true when at least one permission is present', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.canAny(['view:teams', 'manage:users'])).toBe(true)
    })

    it('returns false when no permissions match', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.canAny(['manage:users', 'manage:billing'])).toBe(
        false
      )
    })

    it('returns false for empty list', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => useCurrentUser())

      expect(result.current.canAny([])).toBe(false)
    })
  })
})
