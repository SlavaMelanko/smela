import type { EmailMessage } from '../providers'
import type { UserInvitationEmailData } from '../renderers'
import type { EmailSenderProfileProvider } from '../sender-profile'
import type { SocialLinksProvider } from '../social-links'

import { UserInvitationEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class UserInvitationEmailMessageBuilder extends EmailMessageBuilder<UserInvitationEmailData> {
  async build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileProvider.get(
      EmailSenderType.Support
    )
    const socialLinks = await socialLinksProvider.list()

    const renderer = new UserInvitationEmailRenderer()
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
