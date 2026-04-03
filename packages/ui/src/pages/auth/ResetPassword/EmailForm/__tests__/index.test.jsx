import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import { testData as td } from '@/tests/data'
const en = resources.en.translation

import { EmailForm } from '..'

const renderForm = (onSubmit = vi.fn()) => {
  renderWithProviders(<EmailForm onSubmit={onSubmit} />)

  return {
    emailInput: screen.getByLabelText(en.email.label, { exact: false }),
    submitButton: screen.getByRole('button', {
      name: en.password.reset.request.cta
    })
  }
}

describe('Reset Password Email Form', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders form fields', () => {
    const { emailInput, submitButton } = renderForm()

    expect(emailInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const { emailInput, submitButton } = renderForm()

    await user.type(emailInput, td.email.invalid)
    await user.click(submitButton)

    expect(screen.getByText(en.email.error.format)).toBeInTheDocument()
  })

  it('submits with valid email', async () => {
    const onSubmitMock = vi.fn()
    const { emailInput, submitButton } = renderForm(onSubmitMock)

    await user.type(emailInput, td.email.ok)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({ email: td.email.ok })
    })
  })
})
