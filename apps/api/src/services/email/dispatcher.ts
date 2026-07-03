import type { Metadata, UserPreferences } from '@/emails'

import type { EmailType } from './email-type'
import type { EmailPayload, EmailProvider } from './providers'
import type { EmailRegistry } from './registry'

const createMetadata = (): Metadata => ({
  emailId: Bun.randomUUIDv7(),
  sentAt: new Date().toISOString()
})

const mergeWithDefaultPreferences = (
  preferences?: UserPreferences
): UserPreferences => {
  const defaultPreferences: UserPreferences = { locale: 'en', theme: 'light' }

  return preferences
    ? { ...defaultPreferences, ...preferences }
    : defaultPreferences
}

export class EmailDispatcher {
  constructor(
    private readonly provider: EmailProvider,
    private readonly registry: EmailRegistry
  ) {}

  async send<T>(
    emailType: EmailType,
    to: string | string[],
    data: T,
    preferences?: UserPreferences
  ): Promise<void> {
    const definition = await this.registry.get<T>(emailType)

    const { email, name } = await definition.getSender()

    const renderer = await definition.getRenderer()
    const userPreferences = mergeWithDefaultPreferences(preferences)
    const metadata = createMetadata()
    const { subject, html, text } = await renderer.render(
      data,
      userPreferences,
      metadata
    )

    const payload: EmailPayload = {
      to,
      from: {
        email,
        name
      },
      subject,
      html,
      text
    }

    await this.provider.send(payload)
  }
}
