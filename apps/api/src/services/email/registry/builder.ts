import type { EmailSenderProfileResolver } from '@/emails'

import type { EmailRegistry } from './registry'

import {
  emailVerificationEmail,
  passwordResetEmail,
  userInvitationEmail
} from '../definitions'
import { DefaultEmailRegistry } from './registry-default'

export const buildEmailRegistry = (
  emailSenderProfileResolver: EmailSenderProfileResolver
): EmailRegistry => {
  const registry = new DefaultEmailRegistry()

  registry.add(emailVerificationEmail(emailSenderProfileResolver))
  registry.add(passwordResetEmail(emailSenderProfileResolver))
  registry.add(userInvitationEmail(emailSenderProfileResolver))

  return registry
}
