// Initializes i18next before React renders to ensure translations
// are available on first render (no flicker or re-render).
// Kept separate from LocaleContext so it can be imported outside React.

import { createI18n } from '@smela/i18n'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, loadLocale } from '@/lib/userPreferences'

const i18n = await createI18n({
  lng: loadLocale(),
  fallbackLng: DEFAULT_LOCALE,
  backend: {
    loadPath: '/locales/{{lng}}.json'
  },
  plugins: [HttpBackend, initReactI18next]
})

export default i18n
