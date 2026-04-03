import {
  LocaleProvider,
  ModalProvider,
  ThemeProvider,
  ToastProvider
} from '@smela/ui/contexts'
import { TanStackQueryDevTools } from '@smela/ui/devtools'
import { queryClient } from '@smela/ui/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
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
