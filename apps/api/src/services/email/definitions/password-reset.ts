import type { EmailSenderProfileProvider } from '../sender-profile'

import { EmailType } from '../email-type'
import { EmailSenderProfile } from '../sender-profile'
import { defineEmail } from './email-definition'

export const passwordResetEmail = (
  emailSenderProfileProvider: EmailSenderProfileProvider
) =>
  defineEmail(
    EmailType.PasswordReset,
    async () => emailSenderProfileProvider.get(EmailSenderProfile.Security),
    async () => {
      const { PasswordResetEmailRenderer } = await import('@/emails')

      return new PasswordResetEmailRenderer()
    }
  )
