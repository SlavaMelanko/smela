import type { EmailSenderProfileProvider } from '../sender-profile'

import { EmailType } from '../email-type'
import { EmailSenderProfile } from '../sender-profile'
import { defineEmail } from './email-definition'

export const emailVerificationEmail = (
  emailSenderProfileProvider: EmailSenderProfileProvider
) =>
  defineEmail(
    EmailType.EmailVerification,
    async () => emailSenderProfileProvider.get(EmailSenderProfile.System),
    async () => {
      const { EmailVerificationEmailRenderer } = await import('@/emails')

      return new EmailVerificationEmailRenderer()
    }
  )
