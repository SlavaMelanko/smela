import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import { auth } from '@/tests/data'
import en from '$/locales/en.json'

import { EmailConfirmationForm } from '..'

const renderForm = (onSubmit = jest.fn(), isLoading = false) => {
  renderWithProviders(
    <EmailConfirmationForm
      onSubmit={onSubmit}
      isLoading={isLoading}
      email={auth.email.ok}
    />
  )

  return {
    submitButton: screen.getByRole('button', {
      name: isLoading ? en.processing : en.email.confirmation.cta
    })
  }
}

describe('EmailConfirmation Form', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders submit button', () => {
    const { submitButton } = renderForm()

    expect(submitButton).toHaveTextContent(en.email.confirmation.cta)
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('submits form with email data', async () => {
    const onSubmitMock = jest.fn()
    const { submitButton } = renderForm(onSubmitMock)

    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({ email: auth.email.ok })
    })
  })

  it('shows loading state', () => {
    renderWithProviders(
      <EmailConfirmationForm
        onSubmit={jest.fn()}
        isLoading={true}
        email={auth.email.ok}
      />
    )

    const submitButton = screen.getByRole('button', { name: en.processing })

    expect(submitButton).toHaveTextContent(en.processing)
    expect(submitButton).toBeDisabled()
  })
})
