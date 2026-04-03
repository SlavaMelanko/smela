import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import { testData as td } from '@/tests/data'
const en = resources.en.translation

import { ResetPasswordForm } from '..'

const renderForm = (onSubmit = vi.fn(), isLoading = false) => {
  renderWithProviders(
    <ResetPasswordForm onSubmit={onSubmit} isLoading={isLoading} />
  )

  return {
    passwordInput: screen.getByLabelText(en.password.label.new, {
      exact: false,
      selector: 'input'
    }),
    submitButton: screen.getByRole('button', {
      name: isLoading ? en.processing : en.password.reset.set.cta
    })
  }
}

describe('Set New Password Form', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders form fields', () => {
    const { passwordInput, submitButton } = renderForm()

    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  it('shows validation error for short password', async () => {
    const { passwordInput, submitButton } = renderForm()

    await user.type(passwordInput, td.password.short)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.password.error.min)).toBeInTheDocument()
    })
  })

  it('shows validation error for weak password', async () => {
    const { passwordInput, submitButton } = renderForm()

    await user.type(passwordInput, td.password.onlyLowercase)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.password.error.strong)).toBeInTheDocument()
    })
  })

  it('submits with valid password', async () => {
    const onSubmitMock = vi.fn()
    const { passwordInput, submitButton } = renderForm(onSubmitMock)

    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        newPassword: td.password.strong
      })
    })
  })

  it('shows loading state', () => {
    renderWithProviders(
      <ResetPasswordForm onSubmit={vi.fn()} isLoading={true} />
    )

    const submitButton = screen.getByRole('button', { name: en.processing })

    expect(submitButton).toHaveTextContent(en.processing)
    expect(submitButton).toBeDisabled()
  })
})
