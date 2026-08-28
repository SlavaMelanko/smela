import type {
  EmailProvider,
  SocialLinksResolver,
  UserPreferences
} from '@/emails'

import { logger } from '@/logging'

import type { EmailType } from './email-type'
import type { EmailRegistry } from './registry'

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
    private readonly registry: EmailRegistry,
    private readonly socialLinksResolver: SocialLinksResolver
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
    const socialLinks = await this.socialLinksResolver.list()
    const { subject, html, text } = await renderer.render(
      data,
      userPreferences,
      socialLinks
    )

    try {
      const info = await this.provider.send({
        to,
        from: {
          email,
          name
        },
        subject,
        html,
        text
      })

      logger.info({ ...info, to, subject }, 'Email sent')
    } catch (error) {
      logger.error({ error, to, subject }, 'Failed to send email')
      throw error
    }
  }
}
