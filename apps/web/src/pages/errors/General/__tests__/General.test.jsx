import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { GeneralErrorPage } from '../index'

describe('GeneralErrorPage', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
  })

  it('renders error icon, title, message, and button', () => {
    renderWithProviders(<GeneralErrorPage />)

    expect(screen.getByTestId('general-error-page')).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      en.error.general.title
    )

    expect(screen.getByText(en.error.general.message)).toBeVisible()

    expect(
      screen.getByRole('button', { name: en.error.general.cta })
    ).toBeVisible()
  })

  it('navigates to home when button is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<GeneralErrorPage />)

    await user.click(screen.getByRole('button', { name: en.error.general.cta }))

    expect(global.mockNavigate).toHaveBeenCalledWith('/')
    expect(global.mockNavigate).toHaveBeenCalledTimes(1)
  })
})
