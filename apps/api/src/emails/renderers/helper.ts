import type { ReactElement } from 'react'

import { render } from '@react-email/components'

import type { SocialLink } from '../social-links'

export const renderEmail = async <T>(
  template: (props: {
    data: T
    content: any
    styles: any
    socialLinks?: SocialLink[]
  }) => ReactElement,
  props: {
    data: T
    content: any
    styles: any
    socialLinks?: SocialLink[]
  }
): Promise<{ html: string; text: string }> => {
  const reactElement = template(props)

  const [html, text] = await Promise.all([
    render(reactElement),
    render(reactElement, { plainText: true })
  ])

  return { html, text }
}
