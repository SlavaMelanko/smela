import type { EmailMessage } from '../providers'
import type { EmailSenderProfileResolver } from '../sender-profile'
import type { SocialLinksResolver } from '../social-links'
import type { UserPreferences } from '../user-preferences'

export abstract class EmailMessageBuilder<T> {
  protected constructor(
    protected readonly to: string | string[],
    protected readonly data: T,
    protected readonly preferences?: UserPreferences
  ) {}

  abstract build(
    senderProfileResolver: EmailSenderProfileResolver,
    socialLinksResolver: SocialLinksResolver
  ): Promise<EmailMessage>
}
