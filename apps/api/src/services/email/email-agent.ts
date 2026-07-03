import type { Role, UserPreferences } from '@/types'

import env from '@/env'
import { isAdmin } from '@/types'

import type { SenderProfileProvider } from './sender-profile'

import { EmailDispatcher } from './dispatcher'
import { EmailType } from './email-type'
import { createEmailProvider } from './providers'
import { buildEmailRegistry } from './registry'
import { DatabaseSenderProfileProvider } from './sender-profile'

const getFeBaseUrl = (role: Role) =>
  isAdmin(role) ? env.FE_ADMIN_URL : env.FE_USER_URL

export class EmailAgent {
  private readonly dispatcher: EmailDispatcher

  constructor(senderProfileProvider: SenderProfileProvider) {
    this.dispatcher = new EmailDispatcher(
      createEmailProvider(),
      buildEmailRegistry(senderProfileProvider)
    )
  }

  async sendEmailVerificationEmail(
    firstName: string,
    email: string,
    token: string,
    preferences?: UserPreferences
  ) {
    const verificationUrl = `${env.FE_USER_URL}/verify-email?token=${token}`

    await this.dispatcher.send(
      EmailType.EMAIL_VERIFICATION,
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
      EmailType.PASSWORD_RESET,
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
      EmailType.USER_INVITATION,
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

export const emailAgent = new EmailAgent(new DatabaseSenderProfileProvider())
