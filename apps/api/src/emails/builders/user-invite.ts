import type { EmailMessage } from '../providers'
import type { UserInviteEmailData } from '../renderers'
import type { EmailSenderProfileResolver } from '../sender-profile'
import type { SocialLinksResolver } from '../social-links'

import { UserInviteEmailRenderer } from '../renderers'
import { EmailSenderType } from '../sender-profile'
import { EmailMessageBuilder } from './builder'

export class UserInviteEmailMessageBuilder extends EmailMessageBuilder<UserInviteEmailData> {
  async build(
    senderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileResolver.get(
      EmailSenderType.Support
    )
    const socialLinks = await socialLinksResolver.list()

    const renderer = new UserInviteEmailRenderer()
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
