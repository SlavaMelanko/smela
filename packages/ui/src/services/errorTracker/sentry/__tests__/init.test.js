import { init as sentryInit } from '@sentry/react'

import { init } from '../init'

vi.mock('@sentry/react', () => ({
  init: vi.fn()
}))

describe('Sentry initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('without DSN', () => {
    it('should not initialize Sentry', () => {
      // Global setup.js sets SENTRY_DSN to undefined
      init({ name: 'test', version: '0.0.0' })

      expect(sentryInit).not.toHaveBeenCalled()
    })
  })
})
