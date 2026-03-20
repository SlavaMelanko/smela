import '@testing-library/jest-dom'

import { cleanup } from '@testing-library/react'
import { TextDecoder, TextEncoder } from 'util'

// Ensure text encoding/decoding works in JSDOM
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch globally
global.fetch = jest.fn()

jest.mock('@/lib/env', () => ({
  default: {
    MODE: 'test',
    CAPTCHA_SITE_KEY: 'test-captcha-key',
    BE_BASE_URL: 'https://api.test.com',
    SENTRY_DSN: undefined
  }
}))

const mockExecuteReCaptcha = jest.fn()
const mockResetReCaptcha = jest.fn()

global.mockExecuteReCaptcha = mockExecuteReCaptcha
global.mockResetReCaptcha = mockResetReCaptcha

jest.mock('@/components/InvisibleReCaptcha', () => {
  const { useImperativeHandle } = jest.requireActual('react')

  return {
    __esModule: true,
    InvisibleReCaptcha: ({ ref }) => {
      useImperativeHandle(ref, () => ({
        executeAsync: mockExecuteReCaptcha,
        reset: mockResetReCaptcha
      }))

      return null
    }
  }
})

const mockNavigate = jest.fn()

global.mockNavigate = mockNavigate

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

jest.mock('@/services/errorTracker', () => ({
  clearUser: jest.fn(),
  setUser: jest.fn(),
  initErrorTracker: jest.fn(),
  captureError: jest.fn(),
  captureMessage: jest.fn()
}))

// Clean up DOM and mocks after all tests
afterAll(() => {
  cleanup()
  jest.restoreAllMocks()
})
