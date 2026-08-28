import type { EmailSenderProfileResolver } from '@/emails'

import { EmailSenderType } from '@/emails'

import { EmailType } from '../email-type'
import { defineEmail } from './email-definition'

export const userInvitationEmail = (
  emailSenderProfileResolver: EmailSenderProfileResolver
) =>
  defineEmail(
    EmailType.UserInvitation,
    async () => emailSenderProfileResolver.get(EmailSenderType.Support),
    async () => {
      const { UserInvitationEmailRenderer } = await import('@/emails')

      return new UserInvitationEmailRenderer()
    }
  )
