/** @jsxImportSource react */

import type { SocialLink } from '../../../../social-links'
import { render } from '@react-email/components'

import { describe, expect, it } from 'bun:test'

import { getThemeStyles } from '../../../../styles'
import SocialLinks from '../social-links'

describe('SocialLinks', () => {
  const styles = getThemeStyles('light')

  it('renders a link with the stored svg for each social link', async () => {
    const socialLinks: SocialLink[] = [
      {
        network: 'facebook',
        url: 'https://facebook.com/example',
        svg: '<svg><path d="M0 0" /></svg>'
      }
    ]

    const html = await render(
      <SocialLinks styles={styles} socialLinks={socialLinks} />
    )

    expect(html).toContain('href="https://facebook.com/example"')
    expect(html).toContain('aria-label="Facebook"')
    expect(html).toContain('<path d="M0 0" />')
  })

  it('skips links missing a url or svg', async () => {
    const socialLinks: SocialLink[] = [
      { network: 'facebook', url: '', svg: '<svg></svg>' },
      { network: 'github', url: 'https://github.com/example', svg: '' }
    ]

    const html = await render(
      <SocialLinks styles={styles} socialLinks={socialLinks} />
    )

    expect(html).not.toContain('facebook')
    expect(html).not.toContain('github')
  })

  it('renders nothing when there are no social links', async () => {
    const html = await render(<SocialLinks styles={styles} socialLinks={[]} />)

    expect(html).not.toContain('<a ')
  })
})
