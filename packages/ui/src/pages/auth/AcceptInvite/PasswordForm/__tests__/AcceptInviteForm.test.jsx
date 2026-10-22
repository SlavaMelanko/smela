import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
import { testData as td } from '@ui/tests/data'
const en = resources.en.translation

import { AcceptInviteForm } from '..'

const renderForm = ({ onSubmit = vi.fn(), withNickname } = {}) => {
  renderWithProviders(
    <AcceptInviteForm onSubmit={onSubmit} withNickname={withNickname} />
  )

  return {
    nicknameInput: screen.queryByLabelText(en.nickname.label, {
      exact: false
    }),
    passwordInput: screen.getByLabelText(en.password.label.default, {
      exact: false,
      selector: 'input'
    }),
    submitButton: screen.getByRole('button', { name: en.invite.accept.cta })
  }
}

describe('AcceptInviteForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('asks only for a password by default', async () => {
    const onSubmit = vi.fn()
    const { nicknameInput, passwordInput, submitButton } = renderForm({
      onSubmit
    })

    expect(nicknameInput).not.toBeInTheDocument()

    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        newPassword: td.password.strong
      })
    })
  })

  it('shows an empty nickname field and requires it', async () => {
    const onSubmit = vi.fn()
    const { nicknameInput, passwordInput, submitButton } = renderForm({
      onSubmit,
      withNickname: true
    })

    expect(nicknameInput).toHaveValue('')

    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    expect(
      await screen.findByText(en.nickname.error.required)
    ).toBeInTheDocument()

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a trimmed nickname with the password', async () => {
    const onSubmit = vi.fn()
    const { nicknameInput, passwordInput, submitButton } = renderForm({
      onSubmit,
      withNickname: true
    })

    await user.type(nicknameInput, '  Слава 🌻  ')
    await user.type(passwordInput, td.password.strong)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        nickname: 'Слава 🌻',
        newPassword: td.password.strong
      })
    })
  })
})
