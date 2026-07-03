import type { SenderProfileProvider } from '../sender-profile'

import { EmailType } from '../email-type'
import { SenderProfile } from '../sender-profile'
import { defineEmail } from './email-definition'

export const passwordResetEmail = (
  senderProfileProvider: SenderProfileProvider
) =>
  defineEmail(
    EmailType.PASSWORD_RESET,
    async () => senderProfileProvider.getSender(SenderProfile.Security),
    async () => {
      const { PasswordResetEmailRenderer } = await import('@/emails')

      return new PasswordResetEmailRenderer()
    }
  )
