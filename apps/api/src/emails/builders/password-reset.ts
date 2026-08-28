import type { EmailMessage } from '../providers'
import type { PasswordResetEmailData } from '../renderers'
import type { EmailSenderProfileProvider } from '../sender-profile'
import type { SocialLinksProvider } from '../social-links'

import { PasswordResetEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class PasswordResetEmailMessageBuilder extends EmailMessageBuilder<PasswordResetEmailData> {
  async build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileProvider.get(
      EmailSenderType.Security
    )
    const socialLinks = await socialLinksProvider.list()

    const renderer = new PasswordResetEmailRenderer()
    const { subject, html, text } = await renderer.render(
      this.data,
      this.preferences,
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
