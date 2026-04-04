import './preview.css'

import { createI18n } from '@smela/i18n'
import { MemoryRouter } from 'react-router-dom'
import { initReactI18next } from 'react-i18next'

import { LocaleProvider } from '../src/contexts/LocaleContext'
import { resources } from '@smela/i18n/resources'

// Initialize i18n with bundled resources (no HTTP backend needed in Storybook)
const i18n = await createI18n({
  lng: 'en',
  resources,
  plugins: [initReactI18next]
})

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'contrast',
        title: 'Theme',
        dynamicTitle: true,
        showName: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ]
      }
    },
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        title: 'Locale',
        dynamicTitle: true,
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'uk', right: '🇺🇦', title: 'Українська' }
        ]
      }
    }
  },
  decorators: [
    (Story, context) => {
      const { theme, locale } = context.globals

      document.documentElement.classList.toggle('dark', theme === 'dark')

      if (locale) {
        i18n.changeLanguage(locale)
      }

      return (
        <MemoryRouter>
          <LocaleProvider i18n={i18n}>
            <Story />
          </LocaleProvider>
        </MemoryRouter>
      )
    }
  ]
}

export default preview
