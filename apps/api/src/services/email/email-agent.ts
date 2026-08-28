import type { EmailSenderProfileProvider, SocialLinksProvider } from '@/emails'
import type { Role, UserPreferences } from '@/types'

import env from '@/env'
import { isAdmin } from '@/types'

import { EmailDispatcher } from './dispatcher'
import { EmailType } from './email-type'
import { createEmailProvider } from './providers'
import { buildEmailRegistry } from './registry'
import { DatabaseEmailSenderProfileProvider } from './sender-profile-database'
import { DatabaseSocialLinksProvider } from './social-links'

const getFeBaseUrl = (role: Role) =>
  isAdmin(role) ? env.FE_ADMIN_URL : env.FE_USER_URL

export class EmailAgent {
  private readonly dispatcher: EmailDispatcher
  private readonly senderProfileProvider: EmailSenderProfileProvider
  private readonly socialLinksProvider: SocialLinksProvider

  constructor(
    emailSenderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ) {
    this.senderProfileProvider = emailSenderProfileProvider
    this.socialLinksProvider = socialLinksProvider
    this.dispatcher = new EmailDispatcher(
      createEmailProvider(),
      buildEmailRegistry(emailSenderProfileProvider),
      socialLinksProvider
    )
  }

  // Sender profiles are cached in memory, so writes must drop the stale entry
  invalidateSenderProfiles() {
    this.senderProfileProvider.invalidate()
  }

  // Social links are cached in memory, so writes must drop the stale entry
  invalidateSocialLinks() {
    this.socialLinksProvider.invalidate()
  }

  async sendEmailVerificationEmail(
    firstName: string,
    email: string,
    token: string,
    preferences?: UserPreferences
  ) {
    const verificationUrl = `${env.FE_USER_URL}/verify-email?token=${token}`

    await this.dispatcher.send(
      EmailType.EmailVerification,
      email,
      {
        firstName,
        verificationUrl
      },
      preferences
    )
  }

  async sendResetPasswordEmail(
    firstName: string,
    email: string,
    role: Role,
    token: string,
    preferences?: UserPreferences
  ) {
    const resetUrl = `${getFeBaseUrl(role)}/reset-password?token=${token}`

    await this.dispatcher.send(
      EmailType.PasswordReset,
      email,
      {
        firstName,
        resetUrl
      },
      preferences
    )
  }

  async sendUserInvitationEmail(
    firstName: string,
    email: string,
    role: Role,
    token: string,
    inviterName?: string,
    teamName?: string,
    preferences?: UserPreferences
  ) {
    const inviteUrl = `${getFeBaseUrl(role)}/accept-invite?token=${token}`

    await this.dispatcher.send(
      EmailType.UserInvitation,
      email,
      {
        firstName,
        inviteUrl,
        inviterName,
        teamName
      },
      preferences
    )
  }
}

export const emailAgent = new EmailAgent(
  new DatabaseEmailSenderProfileProvider(),
  new DatabaseSocialLinksProvider()
)
