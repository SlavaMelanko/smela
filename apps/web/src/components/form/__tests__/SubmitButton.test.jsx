import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { SubmitButton } from '../SubmitButton'

describe('SubmitButton', () => {
  it('renders children when not loading', () => {
    renderWithProviders(
      <SubmitButton isLoading={false}>Submit Form</SubmitButton>
    )

    expect(screen.getByRole('button', { name: 'Submit Form' })).toBeVisible()
    expect(screen.queryByText(en.processing)).not.toBeInTheDocument()
  })

  it('shows spinner and processing text when loading', () => {
    const { container } = renderWithProviders(
      <SubmitButton isLoading>Submit Form</SubmitButton>
    )

    expect(screen.getByText(en.processing)).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Submit Form')).not.toBeInTheDocument()
  })

  it('disables button when loading', () => {
    renderWithProviders(<SubmitButton isLoading>Submit Form</SubmitButton>)

    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
  })
})
