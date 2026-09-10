import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { SocialLinkAddForm } from '..'

const renderForm = (onSubmit = vi.fn()) => {
  renderWithProviders(
    <SocialLinkAddForm
      isLoading={false}
      submitLabel={en.socialLink.add.cta}
      onSubmit={onSubmit}
    />
  )

  return {
    nameInput: screen.getByLabelText(en.name.label, { exact: false }),
    urlInput: screen.getByLabelText(en.url.label, { exact: false }),
    submitButton: screen.getByRole('button', { name: en.socialLink.add.cta })
  }
}

describe('SocialLinkAddForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('shows required errors when both fields are empty', async () => {
    const { submitButton } = renderForm()

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.name.error.required)).toBeInTheDocument()
    })

    expect(screen.getByText(en.url.error.required)).toBeInTheDocument()
  })

  it('shows format error when the URL is invalid', async () => {
    const { nameInput, urlInput, submitButton } = renderForm()

    await user.type(nameInput, 'Mastodon')
    await user.type(urlInput, 'not-a-valid-url')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.url.error.format)).toBeInTheDocument()
    })
  })

  it('submits the name and URL when both are valid', async () => {
    const onSubmit = vi.fn()
    const { nameInput, urlInput, submitButton } = renderForm(onSubmit)

    await user.type(nameInput, 'Mastodon')
    await user.type(urlInput, 'https://mastodon.social/@smela')
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Mastodon',
        url: 'https://mastodon.social/@smela'
      })
    })
  })
})
