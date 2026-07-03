import type { SenderProfileProvider } from '../sender-profile'
import type { EmailRegistry } from './registry'

import {
  emailVerificationEmail,
  passwordResetEmail,
  userInvitationEmail
} from '../definitions'
import { DefaultEmailRegistry } from './registry-default'

export const buildEmailRegistry = (
  senderProfileProvider: SenderProfileProvider
): EmailRegistry => {
  const registry = new DefaultEmailRegistry()

  registry.add(emailVerificationEmail(senderProfileProvider))
  registry.add(passwordResetEmail(senderProfileProvider))
  registry.add(userInvitationEmail(senderProfileProvider))

  return registry
}
