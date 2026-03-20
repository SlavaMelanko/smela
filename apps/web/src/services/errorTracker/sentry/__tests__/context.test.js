import { setUser as sentrySetUser } from '@sentry/react'

import { clearUser, setUser } from '../context'

jest.mock('@sentry/react')

describe('setUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set user with id only', () => {
    setUser({ id: '123', email: 'test@example.com', name: 'Test' })

    expect(sentrySetUser).toHaveBeenCalledWith({ id: '123' })
  })
})

describe('clearUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should clear user by setting null', () => {
    clearUser()

    expect(sentrySetUser).toHaveBeenCalledWith(null)
  })
})
