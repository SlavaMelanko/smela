import '@testing-library/jest-dom/vitest'

import { TextDecoder, TextEncoder } from 'node:util'

import { resources } from '@smela/i18n/resources'
import { cleanup } from '@testing-library/react'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder

globalThis.fetch = vi.fn()

i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

vi.mock('@/i18n', () => ({ default: i18next }))

vi.mock('@/lib/env', () => ({
  default: {
    MODE: 'test',
    APP_NAME: 'SMELA'
  }
}))

afterAll(() => {
  cleanup()
})
