import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { LocaleProvider } from '@/contexts/LocaleContext'

export const renderWithProviders = (ui, options = {}) => {
  return render(
    <MemoryRouter>
      <LocaleProvider>{ui}</LocaleProvider>
    </MemoryRouter>,
    options
  )
}
