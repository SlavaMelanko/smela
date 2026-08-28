import type { EmailSenderProfileProvider } from '@/emails'

import type { EmailRegistry } from './registry'

import {
  emailVerificationEmail,
  passwordResetEmail,
  userInvitationEmail
} from '../definitions'
import { DefaultEmailRegistry } from './registry-default'

export const buildEmailRegistry = (
  emailSenderProfileProvider: EmailSenderProfileProvider
): EmailRegistry => {
  const registry = new DefaultEmailRegistry()

  registry.add(emailVerificationEmail(emailSenderProfileProvider))
  registry.add(passwordResetEmail(emailSenderProfileProvider))
  registry.add(userInvitationEmail(emailSenderProfileProvider))

  return registry
}
