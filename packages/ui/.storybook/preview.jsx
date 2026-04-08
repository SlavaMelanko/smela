import '../src/index.css'

import { resources } from '@smela/i18n/resources'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { sb } from 'storybook/test'

import { SidebarProvider } from '../src/components/ui/sidebar'
import { LocaleProvider } from '../src/contexts/LocaleContext'
import { ModalProvider } from '../src/contexts/ModalContext'
import { NotificationProvider } from '../src/contexts/NotificationContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'

// Initialize i18n with static translations (HttpBackend won't work in Storybook)
i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

// Register mocks for auth hooks
sb.mock('../src/hooks/useAuth.js')

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

      const isDark = theme === 'dark'

      // Toggle `dark` class on <html>
      document.documentElement.classList.toggle('dark', isDark)

      // Set i18n language
      if (locale) {
        i18next.changeLanguage(locale)
      }

      const initialPath = context.parameters?.initialPath || '/'

      return (
        <MemoryRouter initialEntries={[initialPath]}>
          <ThemeProvider>
            <LocaleProvider i18n={i18next}>
              <NotificationProvider>
                <ModalProvider>
                  <SidebarProvider>
                    <Story />
                  </SidebarProvider>
                </ModalProvider>
              </NotificationProvider>
            </LocaleProvider>
          </ThemeProvider>
        </MemoryRouter>
      )
    }
  ]
}

export default preview
