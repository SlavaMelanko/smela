import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { captureMessage } from '@/services/errorTracker'
import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { NotFoundErrorPage } from '../index'

describe('NotFoundErrorPage', () => {
  beforeEach(() => {
    global.mockNavigate.mockClear()
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

    expect(global.mockNavigate).toHaveBeenCalledWith('/')
    expect(global.mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('reports 404 to error tracker on mount', () => {
    renderWithProviders(<NotFoundErrorPage />)

    expect(captureMessage).toHaveBeenCalledWith('404 Not Found: /')
    expect(captureMessage).toHaveBeenCalledTimes(1)
  })
})
