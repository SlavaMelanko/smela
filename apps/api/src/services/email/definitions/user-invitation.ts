import type { EmailSenderProfileProvider } from '../sender-profile'

import { EmailType } from '../email-type'
import { EmailSenderProfile } from '../sender-profile'
import { defineEmail } from './email-definition'

export const userInvitationEmail = (
  emailSenderProfileProvider: EmailSenderProfileProvider
) =>
  defineEmail(
    EmailType.USER_INVITATION,
    async () =>
      emailSenderProfileProvider.getSender(EmailSenderProfile.Support),
    async () => {
      const { UserInvitationEmailRenderer } = await import('@/emails')

      return new UserInvitationEmailRenderer()
    }
  )
