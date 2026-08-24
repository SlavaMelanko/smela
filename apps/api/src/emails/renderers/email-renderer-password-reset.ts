import type { UserPreferences } from '@/types'

import type { Metadata } from '../metadata'
import type { SocialLink } from '../social-links'
import type { EmailRenderer, RenderedEmail } from './email-renderer'

import getContent from '../content'
import { getThemeStyles } from '../styles'
import { PasswordResetEmail } from '../templates'
import { renderEmail } from './helper'

export interface PasswordResetEmailData {
  firstName: string
  resetUrl: string
}

export default class PasswordResetEmailRenderer implements EmailRenderer<PasswordResetEmailData> {
  async render(
    data: PasswordResetEmailData,
    userPreferences?: UserPreferences,
    socialLinks?: SocialLink[],
    metadata?: Metadata
  ): Promise<RenderedEmail> {
    const content = getContent(userPreferences?.locale).passwordReset
    const styles = getThemeStyles(userPreferences?.theme)

    const subject = content.subject
    const { html, text } = await renderEmail(PasswordResetEmail, {
      data,
      content,
      styles,
      socialLinks,
      metadata
    })

    return {
      subject,
      html,
      text
    }
  }
}
