import type { EmailRenderer } from '@/emails'

import type { EmailType } from '../email-type'
import type { EmailSender } from '../sender-profile'

export interface EmailDefinition<T = any> {
  getType: () => EmailType
  getRenderer: () => Promise<EmailRenderer<T>>
  getSender: () => Promise<EmailSender>
}

export const defineEmail = <T = any>(
  type: EmailType,
  resolveSender: () => Promise<EmailSender>,
  loadRenderer: () => Promise<EmailRenderer<T>>
): EmailDefinition<T> => ({
  getType: () => type,
  getSender: resolveSender,
  getRenderer: loadRenderer
})
