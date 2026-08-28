import { Resend } from 'resend'

import { logger } from '@/logging'
import { exponentialBackoffDelay, sleepFor } from '@/utils/async'

import type { EmailMessage, EmailProvider } from './provider'

export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error('Email configuration is required.')
    }

    this.resend = new Resend(apiKey)
  }

  async send(msg: EmailMessage): Promise<void> {
    const maxRetries = 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const { error } = await this.resend.emails.send({
        from: `${msg.from.name} <${msg.from.email}>`,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text
      })

      if (!error) {
        if (attempt > 0) {
          logger.info(
            {
              subject: msg.subject
            },
            `Email sent successfully after ${attempt + 1} attempts`
          )
        }

        return
      }

      if (attempt === maxRetries) {
        logger.error(
          error,
          `Failed to send email after ${attempt + 1}/${maxRetries + 1} attempts`,
          { subject: msg.subject }
        )

        return
      }

      logger.warn(
        error,
        `Email attempt ${attempt + 1}/${maxRetries + 1} failed, retrying...`,
        {
          subject: msg.subject
        }
      )

      await sleepFor(exponentialBackoffDelay(1000, attempt))
    }
  }
}
