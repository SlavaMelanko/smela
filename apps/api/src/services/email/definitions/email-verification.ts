import type { EmailSenderProfileProvider } from '@/emails'

import { EmailSenderType } from '@/emails'

import { EmailType } from '../email-type'
import { defineEmail } from './email-definition'

export const emailVerificationEmail = (
  emailSenderProfileProvider: EmailSenderProfileProvider
) =>
  defineEmail(
    EmailType.EmailVerification,
    async () => emailSenderProfileProvider.get(EmailSenderType.System),
    async () => {
      const { EmailVerificationEmailRenderer } = await import('@/emails')

      return new EmailVerificationEmailRenderer()
    }
  )
