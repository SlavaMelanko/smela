import type { SenderProfileProvider } from '../sender-profile'

import { EmailType } from '../email-type'
import { SenderProfile } from '../sender-profile'
import { defineEmail } from './email-definition'

export const emailVerificationEmail = (
  senderProfileProvider: SenderProfileProvider
) =>
  defineEmail(
    EmailType.EMAIL_VERIFICATION,
    async () => senderProfileProvider.getSender(SenderProfile.System),
    async () => {
      const { EmailVerificationEmailRenderer } = await import('@/emails')

      return new EmailVerificationEmailRenderer()
    }
  )
