import type { EmailDefinition } from '../definitions'
import type { EmailType } from '../email-type'
import type { EmailRegistry } from './registry'

export class DefaultEmailRegistry implements EmailRegistry {
  private readonly definitions = new Map<EmailType, EmailDefinition>()

  add<T>(definition: EmailDefinition<T>): void {
    this.definitions.set(definition.getType(), definition)
  }

  async get<T>(emailType: EmailType): Promise<EmailDefinition<T>> {
    const definition = this.definitions.get(emailType)
    if (!definition) {
      throw new Error(`Unknown email type: ${emailType}`)
    }

    return definition as EmailDefinition<T>
  }
}
