import type { ReactElement } from 'react'

import type { CompanyProfile } from '../company'

import type { SocialLink } from '../social-links'
import { render } from '@react-email/components'

interface TemplateProps<T> {
  data: T
  content: any
  styles: any
  company: CompanyProfile
  socialLinks?: SocialLink[]
}

export const renderEmail = async <T>(
  template: (props: TemplateProps<T>) => ReactElement,
  props: TemplateProps<T>
): Promise<{ html: string; text: string }> => {
  const reactElement = template(props)

  const [html, text] = await Promise.all([
    render(reactElement),
    render(reactElement, { plainText: true })
  ])

  return { html, text }
}
