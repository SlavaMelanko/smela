import type { EmailMessage } from '../providers'
import type { EmailVerificationEmailData } from '../renderers'
import type { EmailSenderProfileProvider } from '../sender-profile'
import type { SocialLinksProvider } from '../social-links'

import { EmailVerificationEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class VerificationEmailMessageBuilder extends EmailMessageBuilder<EmailVerificationEmailData> {
  async build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileProvider.get(
      EmailSenderType.System
    )
    const socialLinks = await socialLinksProvider.list()

    const renderer = new EmailVerificationEmailRenderer()
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
