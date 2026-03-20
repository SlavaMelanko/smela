import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import { auth } from '@/tests/data'
import en from '$/locales/en.json'

import { SignupForm } from '..'

const renderForm = (onSubmit = jest.fn()) => {
  renderWithProviders(<SignupForm onSubmit={onSubmit} />)

  return {
    firstNameInput: screen.getByLabelText(en.firstName.label, { exact: false }),
    lastNameInput: screen.getByLabelText(en.lastName.label, { exact: false }),
    emailInput: screen.getByLabelText(en.email.label, { exact: false }),
    passwordInput: screen.getByLabelText(en.password.label.default, {
      exact: false,
      selector: 'input'
    }),
    submitButton: screen.getByRole('button', { name: en.signUp })
  }
}

describe('Signup Form', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders all fields with required indicators', () => {
    const { firstNameInput, lastNameInput, emailInput, passwordInput } =
      renderForm()

    expect(firstNameInput).toBeInTheDocument()
    expect(lastNameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    // Required fields have asterisk, optional fields don't
    const firstNameLabel = screen.getByText(en.firstName.label)
    const lastNameLabel = screen.getByText(en.lastName.label)

    expect(within(firstNameLabel).getByText('*')).toBeInTheDocument()
    expect(within(lastNameLabel).queryByText('*')).not.toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const { firstNameInput, emailInput, passwordInput, submitButton } =
      renderForm()

    await user.type(firstNameInput, auth.firstName.short)
    await user.type(emailInput, auth.email.invalid)
    await user.type(passwordInput, auth.password.short)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.firstName.error.min)).toBeInTheDocument()
      expect(screen.getByText(en.email.error.format)).toBeInTheDocument()
      expect(screen.getByText(en.password.error.min)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const onSubmitMock = jest.fn()
    const {
      firstNameInput,
      lastNameInput,
      emailInput,
      passwordInput,
      submitButton
    } = renderForm(onSubmitMock)

    await user.type(firstNameInput, auth.firstName.ok)
    await user.type(lastNameInput, auth.lastName.ok)
    await user.type(emailInput, auth.email.ok)
    await user.type(passwordInput, auth.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        firstName: auth.firstName.ok,
        lastName: auth.lastName.ok,
        email: auth.email.ok,
        password: auth.password.strong
      })
    })
  })

  it('submits without optional lastName', async () => {
    const onSubmitMock = jest.fn()
    const { firstNameInput, emailInput, passwordInput, submitButton } =
      renderForm(onSubmitMock)

    await user.type(firstNameInput, auth.firstName.ok)
    await user.type(emailInput, auth.email.ok)
    await user.type(passwordInput, auth.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        firstName: auth.firstName.ok,
        email: auth.email.ok,
        password: auth.password.strong
      })
    })
  })
})
