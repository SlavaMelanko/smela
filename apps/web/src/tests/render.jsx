import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { LocaleProvider } from '@/contexts/LocaleContext'
import i18n from '@/i18n'

export const renderWithProviders = (ui, options = {}) => {
  return render(
    <MemoryRouter>
      <LocaleProvider i18n={i18n}>{ui}</LocaleProvider>
    </MemoryRouter>,
    options
  )
}
