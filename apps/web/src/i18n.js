// This file initializes i18next before React renders anything.
// It's kept separate from LocaleContext to ensure translations are available
// immediately on first render (no flicker or re-render).
// This also allows i18n to be imported and used anywhere (outside React),
// like in tests, utilities, or server-side code if needed.

import i18n from 'i18next'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { DEFAULT_LOCALE, loadLocale } from '@/lib/userPreferences'

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: loadLocale(),
    fallbackLng: DEFAULT_LOCALE,
    backend: {
      loadPath: '/locales/{{lng}}.json'
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
