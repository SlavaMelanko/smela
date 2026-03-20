import { init as sentryInit } from '@sentry/react'

import { init } from '../init'

jest.mock('@sentry/react')

describe('Sentry initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('without DSN', () => {
    it('should not initialize Sentry', () => {
      // Global jest.setup.js sets SENTRY_DSN to undefined
      init()

      expect(sentryInit).not.toHaveBeenCalled()
    })
  })
})
