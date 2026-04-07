// Initializes i18next before React renders to ensure translations
// are available on first render (no flicker or re-render).

import { createI18n } from '@smela/i18n'
import { loadLocale } from '@smela/ui/lib/userPreferences'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

const i18n = await createI18n({
  lng: loadLocale(),
  backend: {
    loadPath: '/locales/{{lng}}.json'
  },
  plugins: [HttpBackend, initReactI18next]
})

export default i18n
