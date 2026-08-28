import type { EmailMessage } from '../providers'
import type { UserInvitationEmailData } from '../renderers'
import type { EmailSenderProfileResolver } from '../sender-profile'
import type { SocialLinksResolver } from '../social-links'

import { UserInvitationEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class UserInvitationEmailMessageBuilder extends EmailMessageBuilder<UserInvitationEmailData> {
  async build(
    senderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileResolver.get(
      EmailSenderType.Support
    )
    const socialLinks = await socialLinksResolver.list()

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
