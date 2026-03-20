import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { LoginPrompt } from '..'

describe('LoginPrompt', () => {
  it('renders default question with login link', () => {
    renderWithProviders(<LoginPrompt />)

    expect(screen.getByText(en.alreadyHaveAccount)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.login.verb })).toHaveAttribute(
      'href',
      '/login'
    )
  })

  it('renders custom question when provided', () => {
    const customQuestion = 'Remember your password?'

    renderWithProviders(<LoginPrompt question={customQuestion} />)

    expect(screen.getByText(customQuestion)).toBeInTheDocument()
  })

  it('applies default size class', () => {
    const { container } = renderWithProviders(<LoginPrompt />)

    expect(container.querySelector('p')).toHaveClass('text-sm')
  })

  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-sm'],
    ['default', 'text-base'],
    ['lg', 'text-lg']
  ])('applies %s size variant', (size, expectedClass) => {
    const { container } = renderWithProviders(<LoginPrompt size={size} />)

    expect(container.querySelector('p')).toHaveClass(expectedClass)
  })
})
