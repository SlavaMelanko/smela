import type { EmailSenderProfileProvider } from '@/emails'

import { EmailSenderProfile } from '@/emails'

import { EmailType } from '../email-type'
import { defineEmail } from './email-definition'

export const userInvitationEmail = (
  emailSenderProfileProvider: EmailSenderProfileProvider
) =>
  defineEmail(
    EmailType.UserInvitation,
    async () => emailSenderProfileProvider.get(EmailSenderProfile.Support),
    async () => {
      const { UserInvitationEmailRenderer } = await import('@/emails')

      return new UserInvitationEmailRenderer()
    }
  )
