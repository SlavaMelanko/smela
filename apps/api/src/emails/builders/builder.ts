import type { CompanyProfile } from '../company'
import type { EmailMessage } from '../providers'
import type { EmailSenderProfileResolver } from '../sender-profile'
import type { SocialLinksResolver } from '../social-links'
import type { UserPreferences } from '../user-preferences'

const DEFAULT_PREFERENCES: UserPreferences = { locale: 'en', theme: 'light' }

export abstract class EmailMessageBuilder<T> {
  constructor(
    protected readonly to: string | string[],
    protected readonly data: T,
    protected readonly preferences?: UserPreferences
  ) {}

  protected getPreferences(): UserPreferences {
    return { ...DEFAULT_PREFERENCES, ...this.preferences }
  }

  abstract build(
    senderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver,
    company: CompanyProfile
  ): Promise<EmailMessage>
}
