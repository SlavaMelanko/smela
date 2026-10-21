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
    nicknameInput: screen.getByLabelText(en.nickname.label, { exact: false }),
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
    const { nicknameInput, emailInput, passwordInput } = renderForm()

    expect(nicknameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    expect(screen.queryByText(en.firstName.label)).not.toBeInTheDocument()
    expect(screen.queryByText(en.lastName.label)).not.toBeInTheDocument()
    const nicknameLabel = screen.getByText(en.nickname.label)

    expect(within(nicknameLabel).getByText('*')).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    const { emailInput, passwordInput, submitButton } = renderForm()

    await user.type(emailInput, td.email.invalid)
    await user.type(passwordInput, td.password.short)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.email.error.format)).toBeInTheDocument()
      expect(screen.getByText(en.password.error.min)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const onSubmitMock = vi.fn()
    const { nicknameInput, emailInput, passwordInput, submitButton } =
      renderForm(onSubmitMock)

    await user.type(nicknameInput, '  Слава 🌻  ')
    await user.type(emailInput, td.email.ok)
    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        nickname: 'Слава 🌻',
        email: td.email.ok,
        password: td.password.strong
      })
    })
  })

  it('requires nickname', async () => {
    const onSubmit = vi.fn()
    const { emailInput, passwordInput, submitButton } = renderForm(onSubmit)

    await user.type(emailInput, td.email.ok)
    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)
    expect(
      await screen.findByText(en.nickname.error.required)
    ).toBeInTheDocument()

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
