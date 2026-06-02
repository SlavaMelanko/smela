import { renderHook } from '@testing-library/react'

import { useCurrentUser } from '../useAuth'
import { useHasAccess } from '../useHasAccess'

vi.mock('../useAuth')

const authenticated = ({ permissions = [], ...overrides } = {}) => ({
  isFetching: false,
  isAuthenticated: true,
  permissions,
  canAll: perms => perms.every(p => permissions.includes(p)),
  user: {
    status: 'active',
    role: 'user',
    ...overrides
  }
})

describe('useHasAccess', () => {
  beforeEach(() => {
    useCurrentUser.mockClear()
  })

  it('denies when not authenticated', () => {
    useCurrentUser.mockReturnValue({
      isFetching: false,
      isAuthenticated: false,
      user: null
    })

    const { result } = renderHook(() => useHasAccess())

    expect(result.current.hasAccess).toBe(false)
  })

  it('allows when no requirements and authenticated', () => {
    useCurrentUser.mockReturnValue(authenticated())

    const { result } = renderHook(() => useHasAccess())

    expect(result.current.hasAccess).toBe(true)
  })

  it('returns isFetching true while fetching', () => {
    useCurrentUser.mockReturnValue({
      isFetching: true,
      isAuthenticated: false,
      user: null
    })

    const { result } = renderHook(() => useHasAccess())

    expect(result.current.isFetching).toBe(true)
  })

  describe('requireStatuses', () => {
    it('allows when user status matches', () => {
      useCurrentUser.mockReturnValue(authenticated({ status: 'active' }))

      const { result } = renderHook(() =>
        useHasAccess({ requireStatuses: ['active'] })
      )

      expect(result.current.hasAccess).toBe(true)
    })

    it('denies when user status does not match', () => {
      useCurrentUser.mockReturnValue(authenticated({ status: 'pending' }))

      const { result } = renderHook(() =>
        useHasAccess({ requireStatuses: ['active'] })
      )

      expect(result.current.hasAccess).toBe(false)
    })
  })

  describe('requireRoles', () => {
    it('allows when user role matches', () => {
      useCurrentUser.mockReturnValue(authenticated({ role: 'admin' }))

      const { result } = renderHook(() =>
        useHasAccess({ requireRoles: ['admin'] })
      )

      expect(result.current.hasAccess).toBe(true)
    })

    it('denies when user role does not match', () => {
      useCurrentUser.mockReturnValue(authenticated({ role: 'user' }))

      const { result } = renderHook(() =>
        useHasAccess({ requireRoles: ['admin'] })
      )

      expect(result.current.hasAccess).toBe(false)
    })
  })

  describe('requirePermissions', () => {
    it('allows when user has all required permissions', () => {
      useCurrentUser.mockReturnValue(
        authenticated({ permissions: ['manage:users', 'view:teams'] })
      )

      const { result } = renderHook(() =>
        useHasAccess({ requirePermissions: ['manage:users', 'view:teams'] })
      )

      expect(result.current.hasAccess).toBe(true)
    })

    it('denies when user is missing one required permission', () => {
      useCurrentUser.mockReturnValue(
        authenticated({ permissions: ['view:users'] })
      )

      const { result } = renderHook(() =>
        useHasAccess({ requirePermissions: ['view:users', 'manage:users'] })
      )

      expect(result.current.hasAccess).toBe(false)
    })

    it('allows when requirePermissions is empty', () => {
      useCurrentUser.mockReturnValue(authenticated({ permissions: [] }))

      const { result } = renderHook(() =>
        useHasAccess({ requirePermissions: [] })
      )

      expect(result.current.hasAccess).toBe(true)
    })
  })
})
