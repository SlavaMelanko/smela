import type { ReactElement } from 'react'

import { render } from '@react-email/components'

import type { Metadata } from '../metadata'
import type { SocialLink } from '../social-links'

export const renderEmail = async <T>(
  template: (props: {
    data: T
    content: any
    styles: any
    metadata?: Metadata
    socialLinks?: SocialLink[]
  }) => ReactElement,
  props: {
    data: T
    content: any
    styles: any
    metadata?: Metadata
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
