import { resources } from '@smela/i18n/resources'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
import { testData as td } from '@ui/tests/data'
const en = resources.en.translation

import { SignupForm } from '..'

const renderForm = (onSubmit = vi.fn()) => {
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

    await user.type(firstNameInput, td.firstName.short)
    await user.type(emailInput, td.email.invalid)
    await user.type(passwordInput, td.password.short)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.firstName.error.min)).toBeInTheDocument()
      expect(screen.getByText(en.email.error.format)).toBeInTheDocument()
      expect(screen.getByText(en.password.error.min)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const onSubmitMock = vi.fn()
    const {
      firstNameInput,
      lastNameInput,
      emailInput,
      passwordInput,
      submitButton
    } = renderForm(onSubmitMock)

    await user.type(firstNameInput, td.firstName.ok)
    await user.type(lastNameInput, td.lastName.ok)
    await user.type(emailInput, td.email.ok)
    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        firstName: td.firstName.ok,
        lastName: td.lastName.ok,
        email: td.email.ok,
        password: td.password.strong
      })
    })
  })

  it('submits without optional lastName', async () => {
    const onSubmitMock = vi.fn()
    const { firstNameInput, emailInput, passwordInput, submitButton } =
      renderForm(onSubmitMock)

    await user.type(firstNameInput, td.firstName.ok)
    await user.type(emailInput, td.email.ok)
    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        firstName: td.firstName.ok,
        email: td.email.ok,
        password: td.password.strong
      })
    })
  })
})
