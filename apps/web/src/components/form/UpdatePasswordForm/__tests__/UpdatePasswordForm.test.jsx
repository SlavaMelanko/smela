import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import { testData as td } from '@/tests/data'
import en from '$/locales/en.json'

import { UpdatePasswordForm } from '..'

const renderForm = ({ isSubmitting = false, onSubmit = vi.fn() } = {}) => {
  renderWithProviders(
    <UpdatePasswordForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
  )

  return {
    currentPasswordInput: screen.getByLabelText(en.password.label.current, {
      exact: false
    }),
    newPasswordInput: screen.getByLabelText(en.password.label.new, {
      exact: false
    }),
    submitButton: screen.queryByRole('button', { name: en.password.update.cta })
  }
}

describe('UpdatePasswordForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('resets fields after successful submission', async () => {
    let capturedReset

    const onSubmit = vi.fn((_, reset) => {
      capturedReset = reset
    })

    const { currentPasswordInput, newPasswordInput, submitButton } = renderForm(
      { onSubmit }
    )

    await user.type(currentPasswordInput, td.password.strong)
    await user.type(newPasswordInput, td.password.withSpecialChars)

    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      capturedReset()
    })

    await waitFor(() => {
      expect(currentPasswordInput).toHaveValue('')
      expect(newPasswordInput).toHaveValue('')
    })
  })

  it('shows same-password error when current and new passwords match', async () => {
    const { currentPasswordInput, newPasswordInput, submitButton } =
      renderForm()

    await user.type(currentPasswordInput, td.password.strong)
    await user.type(newPasswordInput, td.password.strong)

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.password.error.same)).toBeInTheDocument()
    })
  })
})
