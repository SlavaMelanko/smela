import '@testing-library/jest-dom/vitest'

import { TextDecoder, TextEncoder } from 'node:util'

import { resources } from '@smela/i18n/resources'
import { cleanup } from '@testing-library/react'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

// Ensure text encoding/decoding works in JSDOM
globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder

// Mock fetch globally
globalThis.fetch = vi.fn()

// Initialize i18n with static English translations so components render
// translated text instead of raw keys (HttpBackend won't work in jsdom)
i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  showSupportNotice: false
})

const mockExecuteReCaptcha = vi.fn()
const mockResetReCaptcha = vi.fn()

globalThis.mockExecuteReCaptcha = mockExecuteReCaptcha
globalThis.mockResetReCaptcha = mockResetReCaptcha

vi.mock('@ui/components/InvisibleReCaptcha', async () => {
  const { useImperativeHandle } = await vi.importActual('react')

  return {
    InvisibleReCaptcha: ({ ref }) => {
      useImperativeHandle(ref, () => ({
        executeAsync: mockExecuteReCaptcha,
        reset: mockResetReCaptcha
      }))

      return null
    }
  }
})

const mockNavigate = vi.fn()

globalThis.mockNavigate = mockNavigate

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate
}))

vi.mock('@ui/services/errorTracker', () => ({
  clearUser: vi.fn(),
  setUser: vi.fn(),
  initErrorTracker: vi.fn(),
  captureError: vi.fn(),
  captureMessage: vi.fn()
}))

// Clean up DOM after all tests
afterAll(() => {
  cleanup()
})
