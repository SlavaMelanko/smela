import { describe, expect, it, mock } from 'bun:test'

import type { ErrorTracker, SeverityLevel } from '../error-tracker'

describe('ErrorTracker', () => {
  const createMockErrorTracker = (): ErrorTracker => ({
    init: mock(() => {}),
    captureError: mock(() => {}),
    captureMessage: mock(() => {}),
    setUser: mock(() => {}),
    clearUser: mock(() => {})
  })

  describe('init', () => {
    it('is callable without arguments', () => {
      const tracker = createMockErrorTracker()

      expect(() => tracker.init()).not.toThrow()
      expect(tracker.init).toHaveBeenCalledTimes(1)
    })
  })

  describe('captureError', () => {
    it('accepts an Error object', () => {
      const tracker = createMockErrorTracker()
      const error = new Error('Test error')

      tracker.captureError(error)

      expect(tracker.captureError).toHaveBeenCalledWith(error)
    })

    it('accepts custom error types', () => {
      const tracker = createMockErrorTracker()

      class CustomError extends Error {
        code = 'CUSTOM_ERROR'
      }

      const error = new CustomError('Custom error')

      tracker.captureError(error)

      expect(tracker.captureError).toHaveBeenCalledWith(error)
    })
  })

  describe('captureMessage', () => {
    it('accepts a message string', () => {
      const tracker = createMockErrorTracker()
      const message = 'Something happened'

      tracker.captureMessage(message)

      expect(tracker.captureMessage).toHaveBeenCalledWith(message)
    })

    it('accepts a message with a severity level', () => {
      const tracker = createMockErrorTracker()
      const message = 'Warning message'
      const level: SeverityLevel = 'warning'

      tracker.captureMessage(message, level)

      expect(tracker.captureMessage).toHaveBeenCalledWith(message, level)
    })

    it('accepts all severity levels', () => {
      const tracker = createMockErrorTracker()
      const levels: SeverityLevel[] = [
        'fatal',
        'error',
        'warning',
        'log',
        'info',
        'debug'
      ]

      levels.forEach(level => {
        tracker.captureMessage(`Message at ${level}`, level)
      })

      expect(tracker.captureMessage).toHaveBeenCalledTimes(levels.length)
    })
  })

  describe('setUser', () => {
    it('accepts a user object with an id', () => {
      const tracker = createMockErrorTracker()
      const user = { id: 'user-123' }

      tracker.setUser(user)

      expect(tracker.setUser).toHaveBeenCalledWith(user)
    })
  })

  describe('clearUser', () => {
    it('is callable without arguments', () => {
      const tracker = createMockErrorTracker()

      tracker.clearUser()

      expect(tracker.clearUser).toHaveBeenCalledTimes(1)
    })
  })
})
