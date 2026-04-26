import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'

const en = resources.en.translation

import { ForbiddenErrorPage } from '../index'

describe('ForbiddenErrorPage', () => {
  beforeEach(() => {
    globalThis.mockNavigate.mockClear()
  })

  it('renders title, message, and button', () => {
    renderWithProviders(<ForbiddenErrorPage />)

    expect(screen.getByTestId('forbidden-error-page')).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      en.error.forbidden.title
    )

    expect(screen.getByText(en.error.forbidden.message)).toBeVisible()

    expect(
      screen.getByRole('button', { name: en.error.forbidden.cta })
    ).toBeVisible()
  })

  it('navigates to home when button is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ForbiddenErrorPage />)

    await user.click(
      screen.getByRole('button', { name: en.error.forbidden.cta })
    )

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/')
    expect(globalThis.mockNavigate).toHaveBeenCalledTimes(1)
  })
})
