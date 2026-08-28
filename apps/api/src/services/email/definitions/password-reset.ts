import type { EmailSenderProfileProvider } from '@/emails'

import { EmailSenderProfile } from '@/emails'

import { EmailType } from '../email-type'
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
