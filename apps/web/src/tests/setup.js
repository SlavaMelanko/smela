import '@testing-library/jest-dom/vitest'

import { TextDecoder, TextEncoder } from 'node:util'

import { cleanup } from '@testing-library/react'
import { readFileSync } from 'fs'
import i18next from 'i18next'
import { resolve } from 'path'
import { initReactI18next } from 'react-i18next'

// Ensure text encoding/decoding works in JSDOM
globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder

// Mock fetch globally
globalThis.fetch = vi.fn()

// Initialize i18n with static English translations so components render
// translated text instead of raw keys (HttpBackend won't work in jsdom)
const enPath = resolve(process.cwd(), 'public/locales/en.json')
const en = JSON.parse(readFileSync(enPath, 'utf-8'))

i18next.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

vi.mock('@/i18n', () => ({ default: i18next }))

vi.mock('@/lib/env', () => ({
  default: {
    MODE: 'test',
    CAPTCHA_SITE_KEY: 'test-captcha-key',
    BE_BASE_URL: 'https://api.test.com',
    SENTRY_DSN: undefined
  }
}))

const mockExecuteReCaptcha = vi.fn()
const mockResetReCaptcha = vi.fn()

globalThis.mockExecuteReCaptcha = mockExecuteReCaptcha
globalThis.mockResetReCaptcha = mockResetReCaptcha

vi.mock('@/components/InvisibleReCaptcha', async () => {
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

vi.mock('@/services/errorTracker', () => ({
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
