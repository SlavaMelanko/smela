import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { SocialLinkAddForm } from '..'

const validSvg = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z" /></svg>'

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
    svgInput: screen.getByLabelText(en.svg.label, { exact: false }),
    submitButton: screen.getByRole('button', { name: en.socialLink.add.cta })
  }
}

describe('SocialLinkAddForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('shows required errors when every field is empty', async () => {
    const { submitButton } = renderForm()

    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(en.name.error.required)).toBeInTheDocument()
    })

    expect(screen.getByText(en.url.error.required)).toBeInTheDocument()
    expect(screen.getByText(en.svg.error.required)).toBeInTheDocument()
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

  it('submits every field once the form is valid', async () => {
    const onSubmit = vi.fn()
    const { nameInput, urlInput, svgInput, submitButton } = renderForm(onSubmit)

    await user.type(nameInput, 'Mastodon')
    await user.type(urlInput, 'https://mastodon.social/@smela')
    await user.type(svgInput, validSvg)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Mastodon',
        url: 'https://mastodon.social/@smela',
        svg: validSvg
      })
    })
  })
})
