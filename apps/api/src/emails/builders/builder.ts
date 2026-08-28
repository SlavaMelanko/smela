import type { EmailMessage } from '../providers'
import type { EmailSenderProfileProvider } from '../sender-profile'
import type { SocialLinksProvider } from '../social-links'
import type { UserPreferences } from '../user-preferences'

export abstract class EmailMessageBuilder<T> {
  protected constructor(
    protected readonly to: string | string[],
    protected readonly data: T,
    protected readonly preferences?: UserPreferences
  ) {}

  abstract build(
    senderProfileProvider: EmailSenderProfileProvider,
    socialLinksProvider: SocialLinksProvider
  ): Promise<EmailMessage>
}
