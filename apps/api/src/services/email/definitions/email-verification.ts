import type { EmailSenderProfileResolver } from '@/emails'

import { EmailSenderType } from '@/emails'

import { EmailType } from '../email-type'
import { defineEmail } from './email-definition'

export const emailVerificationEmail = (
  emailSenderProfileResolver: EmailSenderProfileResolver
) =>
  defineEmail(
    EmailType.EmailVerification,
    async () => emailSenderProfileResolver.get(EmailSenderType.System),
    async () => {
      const { EmailVerificationEmailRenderer } = await import('@/emails')

      return new EmailVerificationEmailRenderer()
    }
  )
