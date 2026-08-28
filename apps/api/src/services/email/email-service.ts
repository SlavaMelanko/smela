import type {
  CompanyProfile,
  EmailMessageBuilder,
  EmailProvider,
  EmailSenderProfileResolver,
  SocialLinksResolver
} from '@/emails'

import env from '@/env'
import { logger } from '@/logging'

import { createEmailProvider } from './provider-factory'
import { ApiEmailSenderProfileResolver } from './sender-profile'
import { ApiSocialLinksResolver } from './social-links'

export class EmailService {
  constructor(
    private readonly provider: EmailProvider,
    private readonly senderProfileResolver: EmailSenderProfileResolver,
    private readonly socialLinksResolver: SocialLinksResolver,
    private readonly company: CompanyProfile
  ) {}

  async send<T>(builder: EmailMessageBuilder<T>): Promise<void> {
    try {
      const message = await builder.build(
        this.senderProfileResolver,
        this.socialLinksResolver,
        this.company
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
  new ApiSocialLinksResolver(),
  { name: env.COMPANY_NAME }
)
