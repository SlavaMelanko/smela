import { setUser as sentrySetUser } from '@sentry/react'

import { clearUser, setUser } from '../context'

vi.mock('@sentry/react', () => ({
  setUser: vi.fn()
}))

describe('setUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set user with id only', () => {
    setUser({ id: '123', email: 'test@example.com', name: 'Test' })

    expect(sentrySetUser).toHaveBeenCalledWith({ id: '123' })
  })
})

describe('clearUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should clear user by setting null', () => {
    clearUser()

    expect(sentrySetUser).toHaveBeenCalledWith(null)
  })
})
