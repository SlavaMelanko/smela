import type { EmailDefinition } from '../definitions'
import type { EmailType } from '../email-type'

export interface EmailRegistry {
  add: <T>(definition: EmailDefinition<T>) => void
  get: <T>(emailType: EmailType) => Promise<EmailDefinition<T>>
}
