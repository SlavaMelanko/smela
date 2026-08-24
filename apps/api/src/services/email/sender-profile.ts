import { systemRepo } from '@/data'
import { logger } from '@/logging'
import { EmailSenderProfile } from '@/types'
import { hour } from '@/utils/chrono'
import { TtlCache } from '@/utils/ttl-cache'

export { EmailSenderProfile }

export interface EmailSender {
  email: string
  name: string
}

type EmailSenders = Map<EmailSenderProfile, EmailSender>

export interface EmailSenderProfileProvider {
  getSender: (profile: EmailSenderProfile) => Promise<EmailSender>
  invalidate: () => void
}

const loadProfiles = async (): Promise<EmailSenders> => {
  try {
    const records = await systemRepo.findEmailSenderProfiles()

    logger.debug({ count: records.length }, 'Loaded email sender profiles')

    return new Map(
      records.map(({ profile, email, name }) => [profile, { email, name }])
    )
  } catch (error) {
    logger.error({ error }, 'Failed to load email sender profiles')
    throw error
  }
}

export class DatabaseEmailSenderProfileProvider implements EmailSenderProfileProvider {
  private readonly cache = new TtlCache(hour(), loadProfiles)

  async getSender(profile: EmailSenderProfile): Promise<EmailSender> {
    const senders = await this.cache.get()

    const sender =
      senders.get(profile) ?? senders.get(EmailSenderProfile.System)

    if (!sender) {
      throw new Error(`No email sender profile found for: ${profile}`)
    }

    return sender
  }

  invalidate() {
    this.cache.invalidate()
  }
}
