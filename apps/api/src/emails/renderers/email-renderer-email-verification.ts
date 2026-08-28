import type { SocialLink } from '../social-links'
import type { UserPreferences } from '../user-preferences'
import type { EmailRenderer, RenderedEmail } from './email-renderer'

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
    userPreferences?: UserPreferences,
    socialLinks?: SocialLink[]
  ): Promise<RenderedEmail> {
    const content = getContent(userPreferences?.locale).emailVerification
    const styles = getThemeStyles(userPreferences?.theme)

    const subject = content.subject
    const { html, text } = await renderEmail(EmailVerificationEmail, {
      data,
      content,
      styles,
      socialLinks
    })

    return {
      subject,
      html,
      text
    }
  }
}
