import { renderHook } from '@testing-library/react'

import { useCurrentUser } from '../useAuth'
import { usePermissions } from '../usePermissions'

vi.mock('../useAuth')

const withPermissions = (permissions = []) =>
  useCurrentUser.mockReturnValue({ permissions })

describe('usePermissions', () => {
  beforeEach(() => {
    useCurrentUser.mockClear()
  })

  describe('can', () => {
    it('returns true when permission is present', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('view:teams')).toBe(true)
    })

    it('returns false when permission is absent', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('manage:users')).toBe(false)
    })

    it('returns false when permissions is empty', () => {
      withPermissions([])

      const { result } = renderHook(() => usePermissions())

      expect(result.current.can('view:teams')).toBe(false)
    })
  })

  describe('canAll', () => {
    it('returns true when all permissions are present', () => {
      withPermissions(['view:teams', 'manage:users'])

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAll(['view:teams', 'manage:users'])).toBe(true)
    })

    it('returns false when one permission is missing', () => {
      withPermissions(['view:teams'])

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAll(['view:teams', 'manage:users'])).toBe(false)
    })

    it('returns true for empty list', () => {
      withPermissions([])

      const { result } = renderHook(() => usePermissions())

      expect(result.current.canAll([])).toBe(true)
    })
  })
})
