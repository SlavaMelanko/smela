import type { EmailSenderProfileResolver } from '@/emails'

import { EmailSenderType } from '@/emails'

import { EmailType } from '../email-type'
import { defineEmail } from './email-definition'

export const passwordResetEmail = (
  emailSenderProfileResolver: EmailSenderProfileResolver
) =>
  defineEmail(
    EmailType.PasswordReset,
    async () => emailSenderProfileResolver.get(EmailSenderType.Security),
    async () => {
      const { PasswordResetEmailRenderer } = await import('@/emails')

      return new PasswordResetEmailRenderer()
    }
  )
