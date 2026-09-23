import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { TeamAddForm } from '..'

const renderForm = (onSubmit = vi.fn()) => {
  renderWithProviders(
    <TeamAddForm
      isLoading={false}
      submitLabel={en.team.add.cta}
      onSubmit={onSubmit}
    />
  )

  return {
    nameInput: screen.getByLabelText(en.name.label, { exact: false }),
    websiteInput: screen.getByLabelText(en.website.label, {
      exact: false
    }),
    descriptionInput: screen.getByLabelText(en.description.label, {
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
      expect(screen.getByText(en.name.error.required)).toBeInTheDocument()
    })
  })

  it('shows max length error when name exceeds 50 characters', async () => {
    const { nameInput, submitButton } = renderForm()

    await user.type(nameInput, 'A'.repeat(51))
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.name.error.max)).toBeInTheDocument()
    })
  })

  it('shows max length error when description exceeds 500 characters', async () => {
    const { nameInput, descriptionInput, submitButton } = renderForm()

    await user.type(nameInput, 'Valid Team')
    await user.type(descriptionInput, 'A'.repeat(501))
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.description.error.max)).toBeInTheDocument()
    })
  })

  it('shows format error when website URL is invalid', async () => {
    const { nameInput, websiteInput, submitButton } = renderForm()

    await user.type(nameInput, 'Valid Team')
    await user.type(websiteInput, 'not-a-valid-url')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.url.error.format)).toBeInTheDocument()
    })
  })

  it('shows max length error when website exceeds 255 characters', async () => {
    const { nameInput, websiteInput, submitButton } = renderForm()
    const longUrl = `https://example.com/${'a'.repeat(240)}`

    await user.type(nameInput, 'Valid Team')
    await user.type(websiteInput, longUrl)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.url.error.max)).toBeInTheDocument()
    })
  })
})
