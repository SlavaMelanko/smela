import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import { auth } from '@/tests/data'
import en from '$/locales/en.json'

import { LoginForm } from '..'

const renderForm = (onSubmit = jest.fn()) => {
  renderWithProviders(<LoginForm onSubmit={onSubmit} />)

  return {
    emailInput: screen.getByLabelText(en.email.label, { exact: false }),
    passwordInput: screen.getByLabelText(en.password.label.default, {
      exact: false,
      selector: 'input'
    }),
    submitButton: screen.getByRole('button', { name: en.login.verb })
  }
}

describe('Login Form', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders all form fields', () => {
    const { emailInput, passwordInput, submitButton } = renderForm()

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const { emailInput, passwordInput, submitButton } = renderForm()

    await user.type(emailInput, auth.email.invalid)
    await user.type(passwordInput, auth.password.short)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.email.error.format)).toBeInTheDocument()
      expect(screen.getByText(en.password.error.min)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const onSubmitMock = jest.fn()
    const { emailInput, passwordInput, submitButton } = renderForm(onSubmitMock)

    await user.type(emailInput, auth.email.ok)
    await user.type(passwordInput, auth.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: auth.email.ok,
        password: auth.password.strong
      })
    })
  })

  it('shows loading state during submission', async () => {
    const onSubmitMock = jest.fn(() => new Promise(res => setTimeout(res, 100)))
    const { emailInput, passwordInput, submitButton } = renderForm(onSubmitMock)

    await user.type(emailInput, auth.email.ok)
    await user.type(passwordInput, auth.password.strong)
    user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(en.processing)
    })
  })
})
