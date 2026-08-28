import type {
  EmailSenderProfileProvider,
  EmailVerificationEmailData,
  PasswordResetEmailData,
  SocialLinksProvider,
  UserInvitationEmailData,
  UserPreferences
} from '@/emails'

import {
  EmailSenderProfile,
  EmailVerificationEmailRenderer,
  PasswordResetEmailRenderer,
  UserInvitationEmailRenderer
} from '@/emails'

import type { EmailMessage } from './providers'

export abstract class EmailMessageBuilder<T> {
  protected constructor(
    protected readonly to: string | string[],
    protected readonly data: T,
    protected readonly preferences?: UserPreferences
  ) {}

  abstract build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage>
}

export class VerificationEmailMessageBuilder extends EmailMessageBuilder<EmailVerificationEmailData> {
  async build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileProvider.get(
      EmailSenderProfile.System
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

export class PasswordResetEmailMessageBuilder extends EmailMessageBuilder<PasswordResetEmailData> {
  async build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileProvider.get(
      EmailSenderProfile.Security
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

export class UserInvitationEmailMessageBuilder extends EmailMessageBuilder<UserInvitationEmailData> {
  async build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage> {
    const senderProfile = await senderProfileProvider.get(
      EmailSenderProfile.Support
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
