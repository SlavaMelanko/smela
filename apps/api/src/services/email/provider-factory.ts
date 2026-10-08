import type { EmailProvider, EmailProviderType } from '@smela/emails'

import { EtherealEmailProvider, ResendEmailProvider } from '@smela/emails'

import { env } from '@/env'
import { logger } from '@/logging'

const determineProvider = (): EmailProviderType =>
  env.EMAIL_RESEND_API_KEY ? 'resend' : 'ethereal'

export const createEmailProvider = (
  type: EmailProviderType = determineProvider()
): EmailProvider => {
  logger.info(`📧 Email provider: ${type}`)

  switch (type) {
    case 'ethereal': {
      return new EtherealEmailProvider(
        env.EMAIL_ETHEREAL_HOST,
        env.EMAIL_ETHEREAL_PORT,
        env.EMAIL_ETHEREAL_USERNAME,
        env.EMAIL_ETHEREAL_PASSWORD
      )
    }
    case 'resend': {
      return new ResendEmailProvider(env.EMAIL_RESEND_API_KEY)
    }
  }
}
