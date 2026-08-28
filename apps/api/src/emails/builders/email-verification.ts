import type { CompanyProfile } from '../company'
import type { EmailMessage } from '../providers'
import type { EmailVerificationEmailData } from '../renderers'
import type { EmailSenderProfileResolver } from '../sender-profile'
import type { SocialLinksResolver } from '../social-links'

import { EmailVerificationEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class VerificationEmailMessageBuilder extends EmailMessageBuilder<EmailVerificationEmailData> {
  async build(
    senderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver,
    company: CompanyProfile
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileResolver.get(
      EmailSenderType.System
    )
    const socialLinks = await socialLinksResolver.list()

    const renderer = new EmailVerificationEmailRenderer()
    const { subject, html, text } = await renderer.render(this.data, {
      company,
      preferences: this.getPreferences(),
      socialLinks
    })

    return {
      to: this.to,
      from: senderProfile,
      subject,
      html,
      text
    }
  }
}
