import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { SignupPrompt } from '..'

describe('SignupPrompt', () => {
  it('renders signup link', () => {
    renderWithProviders(<SignupPrompt />)

    expect(screen.getByText(en.doNotHaveAccount)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.signUp })).toHaveAttribute(
      'href',
      '/pricing'
    )
  })

  it('applies default size class', () => {
    const { container } = renderWithProviders(<SignupPrompt />)

    expect(container.querySelector('p')).toHaveClass('text-sm')
  })

  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-sm'],
    ['default', 'text-base'],
    ['lg', 'text-lg']
  ])('applies %s size variant', (size, expectedClass) => {
    const { container } = renderWithProviders(<SignupPrompt size={size} />)

    expect(container.querySelector('p')).toHaveClass(expectedClass)
  })
})
