import type {
  EmailRenderer,
  RenderContext,
  RenderedEmail
} from './email-renderer'

import getContent from '../content'
import { getThemeStyles } from '../styles'
import { EmailVerificationEmail } from '../templates'
import { renderEmail } from './helper'

export interface EmailVerificationEmailData {
  firstName: string
  verificationUrl: string
}

export default class EmailVerificationEmailRenderer implements EmailRenderer<EmailVerificationEmailData> {
  async render(
    data: EmailVerificationEmailData,
    { company, preferences, socialLinks }: RenderContext
  ): Promise<RenderedEmail> {
    const content = getContent(preferences?.locale).emailVerification
    const styles = getThemeStyles(preferences?.theme)

    const subject = content.subject
    const { html, text } = await renderEmail(EmailVerificationEmail, {
      data,
      content,
      styles,
      socialLinks,
      company
    })

    return {
      subject,
      html,
      text
    }
  }
}
