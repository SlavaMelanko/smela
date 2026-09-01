import type {
  EmailRenderer,
  RenderContext,
  RenderedEmail
} from './email-renderer'

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
    { company, preferences, socialLinks }: RenderContext
  ): Promise<RenderedEmail> {
    const content = getContent(preferences?.locale).passwordReset
    const styles = getThemeStyles(preferences?.theme)

    const subject = content.subject
    const { html, text } = await renderEmail(PasswordResetEmail, {
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
