import type {
  EmailMessageBuilder,
  EmailProvider,
  EmailSenderProfileResolver,
  SocialLinksResolver
} from '@/emails'

import { logger } from '@/logging'

import { createEmailProvider } from './provider-factory'
import { ApiEmailSenderProfileResolver } from './sender-profile'
import { ApiSocialLinksResolver } from './social-links'

export class EmailService {
  constructor(
    private readonly provider: EmailProvider,
    private readonly senderProfileResolver: EmailSenderProfileResolver,
    private readonly socialLinksResolver: SocialLinksResolver
  ) {}

  async send<T>(builder: EmailMessageBuilder<T>): Promise<void> {
    try {
      const message = await builder.build(
        this.senderProfileResolver,
        this.socialLinksResolver
      )

      const info = await this.provider.send(message)

      logger.info(
        { ...info, to: message.to, subject: message.subject },
        'Email sent'
      )
    } catch (error) {
      logger.error({ error }, 'Failed to send email')
    }
  }

  invalidateSenderProfiles() {
    this.senderProfileResolver.invalidate()
  }

  invalidateSocialLinks() {
    this.socialLinksResolver.invalidate()
  }
}

export const emailService = new EmailService(
  createEmailProvider(),
  new ApiEmailSenderProfileResolver(),
  new ApiSocialLinksResolver()
)
