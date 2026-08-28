import type { EmailSenderProfileProvider } from '@/emails'

import { EmailSenderProfile } from '@/emails'

import { EmailType } from '../email-type'
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
