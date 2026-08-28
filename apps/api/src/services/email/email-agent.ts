import type { EmailSenderProfileResolver, SocialLinksResolver } from '@/emails'
import type { Role, UserPreferences } from '@/types'

import env from '@/env'
import { isAdmin } from '@/types'

import { EmailDispatcher } from './dispatcher'
import { EmailType } from './email-type'
import { createEmailProvider } from './provider-factory'
import { buildEmailRegistry } from './registry'
import { DatabaseEmailSenderProfileResolver } from './sender-profile'
import { DatabaseSocialLinksResolver } from './social-links'

const getFeBaseUrl = (role: Role) =>
  isAdmin(role) ? env.FE_ADMIN_URL : env.FE_USER_URL

export class EmailAgent {
  private readonly dispatcher: EmailDispatcher
  private readonly senderProfileResolver: EmailSenderProfileResolver
  private readonly socialLinksResolver: SocialLinksResolver

  constructor(
    emailSenderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver
  ) {
    this.senderProfileResolver = emailSenderProfileResolver
    this.socialLinksResolver = socialLinksResolver
    this.dispatcher = new EmailDispatcher(
      createEmailProvider(),
      buildEmailRegistry(emailSenderProfileResolver),
      socialLinksResolver
    )
  }

  // Sender profiles are cached in memory, so writes must drop the stale entry
  invalidateSenderProfiles() {
    this.senderProfileResolver.invalidate()
  }

  // Social links are cached in memory, so writes must drop the stale entry
  invalidateSocialLinks() {
    this.socialLinksResolver.invalidate()
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
  new DatabaseEmailSenderProfileResolver(),
  new DatabaseSocialLinksResolver()
)
