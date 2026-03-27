import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useTheme } from '@/hooks/useTheme'
import { renderWithProviders } from '@/tests'

import { ThemeToggle } from '../ThemeToggle'

const mockToggleTheme = vi.fn()

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn()
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockToggleTheme.mockClear()

    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme
    })
  })

  it('renders button with aria-label', () => {
    renderWithProviders(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'Theme toggle' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('relative', 'rounded-full')
  })

  it('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Theme toggle' }))

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })
})
