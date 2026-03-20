import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { ForgotYourPasswordPrompt } from '..'

describe('ForgotYourPasswordPrompt', () => {
  it('renders forgot password link', () => {
    renderWithProviders(<ForgotYourPasswordPrompt />)

    expect(
      screen.getByRole('link', { name: en.forgotYourPassword })
    ).toHaveAttribute('href', '/reset-password')
  })

  it('applies default size class', () => {
    const { container } = renderWithProviders(<ForgotYourPasswordPrompt />)

    expect(container.querySelector('p')).toHaveClass('text-sm')
  })

  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-sm'],
    ['default', 'text-base'],
    ['lg', 'text-lg']
  ])('applies %s size variant', (size, expectedClass) => {
    const { container } = renderWithProviders(
      <ForgotYourPasswordPrompt size={size} />
    )

    expect(container.querySelector('p')).toHaveClass(expectedClass)
  })
})
