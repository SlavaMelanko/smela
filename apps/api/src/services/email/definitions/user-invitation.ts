import type { SenderProfileProvider } from '../sender-profile'

import { EmailType } from '../email-type'
import { SenderProfile } from '../sender-profile'
import { defineEmail } from './email-definition'

export const userInvitationEmail = (
  senderProfileProvider: SenderProfileProvider
) =>
  defineEmail(
    EmailType.USER_INVITATION,
    async () => senderProfileProvider.getSender(SenderProfile.SUPPORT),
    async () => {
      const { UserInvitationEmailRenderer } = await import('@/emails')

      return new UserInvitationEmailRenderer()
    }
  )
