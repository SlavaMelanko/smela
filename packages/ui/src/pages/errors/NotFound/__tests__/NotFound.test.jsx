import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { captureMessage } from '@ui/services/errorTracker'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { NotFoundErrorPage } from '../index'

describe('NotFoundErrorPage', () => {
  beforeEach(() => {
    globalThis.mockNavigate.mockClear()
    captureMessage.mockClear()
  })

  it('renders title, message, and button', () => {
    renderWithProviders(<NotFoundErrorPage />)

    expect(screen.getByTestId('not-found-error-page')).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      en.error.notFound.title
    )

    expect(screen.getByText(en.error.notFound.message)).toBeVisible()

    expect(
      screen.getByRole('button', { name: en.error.notFound.cta })
    ).toBeVisible()
  })

  it('navigates to home when button is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NotFoundErrorPage />)

    await user.click(
      screen.getByRole('button', { name: en.error.notFound.cta })
    )

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/')
    expect(globalThis.mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('reports 404 to error tracker on mount', () => {
    renderWithProviders(<NotFoundErrorPage />)

    expect(captureMessage).toHaveBeenCalledWith('404 Not Found: /')
    expect(captureMessage).toHaveBeenCalledTimes(1)
  })
})
