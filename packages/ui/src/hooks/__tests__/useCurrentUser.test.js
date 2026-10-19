import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { accessTokenStorage } from '@ui/lib/storage'
import { userApi } from '@ui/services/backend'
import { createElement } from 'react'

import { useCurrentUser } from '../useAuth'

vi.mock('@ui/services/backend', () => ({
  authApi: {},
  userApi: { getCurrentUser: vi.fn() }
}))

const renderCurrentUser = async ({ permissions = [], team } = {}) => {
  userApi.getCurrentUser.mockResolvedValue({
    user: { id: 'user-1', role: 'user', status: 'active' },
    team,
    permissions
  })

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const wrapper = ({ children }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)

  const { result } = renderHook(() => useCurrentUser(), { wrapper })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))

  return result.current
}

describe('useCurrentUser: permissions', () => {
  beforeEach(() => {
    accessTokenStorage.set('access-token')
  })

  afterEach(() => {
    accessTokenStorage.remove()
  })

  describe('can', () => {
    it('checks user-wide permissions', async () => {
      const { can } = await renderCurrentUser({
        permissions: ['view:dashboard']
      })

      expect(can('view:dashboard')).toBe(true)
      expect(can('manage:dashboard')).toBe(false)
    })
  })

  describe('canAll', () => {
    it('requires every user-wide permission', async () => {
      const { canAll } = await renderCurrentUser({
        permissions: ['view:dashboard', 'manage:dashboard']
      })

      expect(canAll(['view:dashboard', 'manage:dashboard'])).toBe(true)
      expect(canAll(['view:dashboard', 'view:users'])).toBe(false)
      expect(canAll([])).toBe(true)
    })
  })

  describe('canInTeam', () => {
    it('checks team permissions, not user-wide ones', async () => {
      const { canInTeam } = await renderCurrentUser({
        permissions: ['manage:teams'],
        team: { id: 'team-1', name: 'Acme', permissions: ['view:teams'] }
      })

      expect(canInTeam('view:teams')).toBe(true)
      expect(canInTeam('manage:teams')).toBe(false)
    })

    it('returns false when user has no team', async () => {
      const { canInTeam } = await renderCurrentUser({
        permissions: ['view:teams']
      })

      expect(canInTeam('view:teams')).toBe(false)
    })
  })

  describe('canAllInTeam', () => {
    it('requires every team permission', async () => {
      const { canAllInTeam } = await renderCurrentUser({
        team: {
          id: 'team-1',
          name: 'Acme',
          permissions: ['view:teams', 'manage:teams']
        }
      })

      expect(canAllInTeam(['view:teams', 'manage:teams'])).toBe(true)
      expect(canAllInTeam(['view:teams', 'view:users'])).toBe(false)
    })
  })
})
