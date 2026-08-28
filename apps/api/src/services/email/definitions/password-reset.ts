import type { EmailSenderProfileProvider } from '@/emails'

import { EmailSenderType } from '@/emails'

import { EmailType } from '../email-type'
import { defineEmail } from './email-definition'

export const passwordResetEmail = (
  emailSenderProfileProvider: EmailSenderProfileProvider
) =>
  defineEmail(
    EmailType.PasswordReset,
    async () => emailSenderProfileProvider.get(EmailSenderType.Security),
    async () => {
      const { PasswordResetEmailRenderer } = await import('@/emails')

      return new PasswordResetEmailRenderer()
    }
  )
