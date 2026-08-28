import type { EmailMessage } from '../providers'
import type { PasswordResetEmailData } from '../renderers'
import type { EmailSenderProfileResolver } from '../sender-profile'
import type { SocialLinksResolver } from '../social-links'

import { PasswordResetEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class PasswordResetEmailMessageBuilder extends EmailMessageBuilder<PasswordResetEmailData> {
  async build(
    senderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileResolver.get(
      EmailSenderType.Security
    )
    const socialLinks = await socialLinksResolver.list()

    const renderer = new PasswordResetEmailRenderer()
    const { subject, html, text } = await renderer.render(
      this.data,
      this.getPreferences(),
      socialLinks
    )

    return {
      to: this.to,
      from: senderProfile,
      subject,
      html,
      text
    }
  }
}
