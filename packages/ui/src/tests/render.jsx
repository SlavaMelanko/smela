import { render } from '@testing-library/react'
import { LocaleProvider } from '@ui/contexts/LocaleContext'
import { MemoryRouter } from 'react-router-dom'

export const renderWithProviders = (ui, options = {}) => {
  return render(
    <MemoryRouter>
      <LocaleProvider>{ui}</LocaleProvider>
    </MemoryRouter>,
    options
  )
}
