import type { EmailRenderer, EmailSenderProfile } from '@/emails'

import type { EmailType } from '../email-type'

export interface EmailDefinition<T = any> {
  getType: () => EmailType
  getRenderer: () => Promise<EmailRenderer<T>>
  getSender: () => Promise<EmailSenderProfile>
}

export const defineEmail = <T = any>(
  type: EmailType,
  resolveSender: () => Promise<EmailSenderProfile>,
  loadRenderer: () => Promise<EmailRenderer<T>>
): EmailDefinition<T> => ({
  getType: () => type,
  getSender: resolveSender,
  getRenderer: loadRenderer
})
