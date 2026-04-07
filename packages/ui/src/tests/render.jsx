import { render } from '@testing-library/react'
import { LocaleProvider } from '@ui/contexts/LocaleContext'
// i18next global is pre-initialized with English translations in setup.js
import i18n from 'i18next'
import { MemoryRouter } from 'react-router-dom'

export const renderWithProviders = (ui, options = {}) => {
  return render(
    <MemoryRouter>
      <LocaleProvider i18n={i18n}>{ui}</LocaleProvider>
    </MemoryRouter>,
    options
  )
}
