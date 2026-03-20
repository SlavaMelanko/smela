import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { TeamAddForm } from '..'

const renderForm = (onSubmit = jest.fn()) => {
  renderWithProviders(
    <TeamAddForm
      isLoading={false}
      submitLabel={en.team.add.cta}
      onSubmit={onSubmit}
    />
  )

  return {
    nameInput: screen.getByLabelText(en.team.name.label, { exact: false }),
    websiteInput: screen.getByLabelText(en.team.website.label, {
      exact: false
    }),
    descriptionInput: screen.getByLabelText(en.team.description.label, {
      exact: false
    }),
    submitButton: screen.getByRole('button', { name: en.team.add.cta })
  }
}

describe('TeamAddForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('shows required error when name is empty', async () => {
    const { submitButton } = renderForm()

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.team.name.error.required)).toBeInTheDocument()
    })
  })

  it('shows min length error when name is too short', async () => {
    const { nameInput, submitButton } = renderForm()

    await user.type(nameInput, 'A')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.team.name.error.min)).toBeInTheDocument()
    })
  })

  it('shows max length error when name exceeds 100 characters', async () => {
    const { nameInput, submitButton } = renderForm()

    await user.type(nameInput, 'A'.repeat(101))
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.team.name.error.max)).toBeInTheDocument()
    })
  })

  it('shows max length error when description exceeds 500 characters', async () => {
    const { nameInput, descriptionInput, submitButton } = renderForm()

    await user.type(nameInput, 'Valid Team')
    await user.type(descriptionInput, 'A'.repeat(501))
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(en.team.description.error.max)
      ).toBeInTheDocument()
    })
  })

  it('shows format error when website URL is invalid', async () => {
    const { nameInput, websiteInput, submitButton } = renderForm()

    await user.type(nameInput, 'Valid Team')
    await user.type(websiteInput, 'not-a-valid-url')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.team.website.error.format)).toBeInTheDocument()
    })
  })
})
