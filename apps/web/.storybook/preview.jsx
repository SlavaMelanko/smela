import '../src/index.css'

import { MemoryRouter } from 'react-router-dom'
import { sb } from 'storybook/test'

import { SidebarProvider } from '../src/components/ui/sidebar'
import { LocaleProvider } from '../src/contexts/LocaleContext'
import { ModalProvider } from '../src/contexts/ModalContext'
import { NotificationProvider } from '../src/contexts/NotificationContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import i18n from '../src/i18n'

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

      // toggle `dark` class on <html>
      document.documentElement.classList.toggle('dark', isDark)

      // Set i18n language
      if (locale) {
        i18n.changeLanguage(locale)
      }

      const initialPath = context.parameters?.initialPath || '/'

      return (
        <MemoryRouter initialEntries={[initialPath]}>
          <ThemeProvider>
            <LocaleProvider>
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
