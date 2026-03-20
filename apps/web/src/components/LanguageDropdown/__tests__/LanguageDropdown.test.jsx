import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLocale } from '@/hooks/useLocale'
import { renderWithProviders } from '@/tests'

import { LanguageDropdown } from '../LanguageDropdown'
import { languages } from '../languages'

const mockChangeLocale = jest.fn()

jest.mock('@/hooks/useLocale', () => ({
  useLocale: jest.fn()
}))

jest.mock('../flags', () => ({
  __esModule: true,
  default: {
    us: '/mock-us-flag.svg',
    ua: '/mock-ua-flag.svg'
  }
}))

describe('LanguageDropdown', () => {
  beforeEach(() => {
    mockChangeLocale.mockClear()

    useLocale.mockReturnValue({
      locale: 'en',
      changeLocale: mockChangeLocale
    })
  })

  it('renders with current language flag button', () => {
    renderWithProviders(<LanguageDropdown />)

    const button = screen.getByRole('button', { name: 'Change language' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('rounded-full')
  })

  it('opens dropdown and displays all language options when clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LanguageDropdown />)

    const button = screen.getByRole('button', { name: 'Change language' })

    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    const menu = screen.getByRole('menu')

    languages.forEach(lang => {
      expect(within(menu).getByText(lang.name)).toBeInTheDocument()
    })
  })

  it('calls changeLocale when selecting a different language', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LanguageDropdown />)

    const button = screen.getByRole('button', { name: 'Change language' })

    await user.click(button)

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    const ukrainianOption = screen.getByRole('menuitemradio', {
      name: /Українська/
    })

    await user.click(ukrainianOption)

    expect(mockChangeLocale).toHaveBeenCalledTimes(1)
    expect(mockChangeLocale.mock.calls[0][0]).toBe('uk')
  })

  it('displays correct flag based on current locale', () => {
    const { container } = renderWithProviders(<LanguageDropdown />)

    const flag = container.querySelector('img')

    expect(flag).toHaveAttribute('alt', 'us')
  })

  it('switches to Ukrainian flag when locale is Ukrainian', () => {
    useLocale.mockReturnValue({
      locale: 'uk',
      changeLocale: mockChangeLocale
    })

    const { container } = renderWithProviders(<LanguageDropdown />)

    const flag = container.querySelector('img')

    expect(flag).toHaveAttribute('alt', 'ua')
  })
})
