import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { LocaleProvider } from '@/contexts/LocaleContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { TanStackQueryDevTools } from '@/devtools'
import i18n from '@/i18n'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider i18n={i18n}>
          <ToastProvider>
            <ModalProvider>
              <RouterProvider router={router} />
            </ModalProvider>
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
      <TanStackQueryDevTools />
    </QueryClientProvider>
  )
}

export default App
