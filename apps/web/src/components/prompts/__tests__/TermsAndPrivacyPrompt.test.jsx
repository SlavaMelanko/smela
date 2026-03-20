import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { TermsAndPrivacyPrompt } from '..'

describe('TermsAndPrivacyPrompt', () => {
  it('renders terms and privacy links', () => {
    renderWithProviders(<TermsAndPrivacyPrompt />)

    expect(
      screen.getByRole('link', { name: en.termsAndPrivacy.terms })
    ).toHaveAttribute('href', '/terms')

    expect(
      screen.getByRole('link', { name: en.termsAndPrivacy.privacy })
    ).toHaveAttribute('href', '/privacy')
  })

  it('applies default size class', () => {
    const { container } = renderWithProviders(<TermsAndPrivacyPrompt />)

    expect(container.querySelector('p')).toHaveClass('text-sm')
  })

  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-sm'],
    ['default', 'text-base'],
    ['lg', 'text-lg']
  ])('applies %s size variant', (size, expectedClass) => {
    const { container } = renderWithProviders(
      <TermsAndPrivacyPrompt size={size} />
    )

    expect(container.querySelector('p')).toHaveClass(expectedClass)
  })
})
