import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUrlParams } from '@/hooks/useUrlParams'
import { NetworkErrorType } from '@/lib/net'
import { renderWithProviders } from '@/tests'
const en = resources.en.translation

import { NetworkErrorPage } from '../index'

vi.mock('@/hooks/useUrlParams')

describe('NetworkErrorPage', () => {
  beforeEach(() => {
    globalThis.mockNavigate.mockClear()
    useUrlParams.mockClear()
    useUrlParams.mockReturnValue({ errorType: null })
  })

  it('renders title, button, and data-testid', () => {
    renderWithProviders(<NetworkErrorPage />)

    expect(screen.getByTestId('network-error-page')).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      en.error.network.title
    )

    expect(
      screen.getByRole('button', { name: en.error.network.cta })
    ).toBeVisible()
  })

  it.each([
    [null, 'unknown'],
    [NetworkErrorType.CONNECTION_REFUSED, 'connectionRefused'],
    [NetworkErrorType.TIMEOUT, 'timeout']
  ])('displays %s message', (errorType, messageKey) => {
    useUrlParams.mockReturnValue({ errorType })

    renderWithProviders(<NetworkErrorPage />)

    expect(screen.getByText(en.error.network.message[messageKey])).toBeVisible()
  })

  it('navigates back when button is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NetworkErrorPage />)

    await user.click(screen.getByRole('button', { name: en.error.network.cta }))

    expect(globalThis.mockNavigate).toHaveBeenCalledWith(-1)
    expect(globalThis.mockNavigate).toHaveBeenCalledTimes(1)
  })
})
