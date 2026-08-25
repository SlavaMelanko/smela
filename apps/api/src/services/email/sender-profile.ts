import { systemRepo } from '@/data'
import { logger } from '@/logging'
import { EmailSenderProfile } from '@/types'
import { TtlCache } from '@/utils/ttl-cache'

export { EmailSenderProfile }

export interface EmailSender {
  email: string
  name: string
}

type EmailSenders = Map<EmailSenderProfile, EmailSender>

export interface EmailSenderProfileProvider {
  get: (profile: EmailSenderProfile) => Promise<EmailSender>
  invalidate: () => void
}

const loadProfiles = async (): Promise<EmailSenders> => {
  try {
    const records = await systemRepo.listEmailSenderProfiles()

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
  private readonly cache = new TtlCache(loadProfiles)

  async get(profile: EmailSenderProfile): Promise<EmailSender> {
    const profiles = await this.cache.get()

    const sender =
      profiles.get(profile) ?? profiles.get(EmailSenderProfile.System)

    if (!sender) {
      throw new Error(`No email sender profile found for: ${profile}`)
    }

    return sender
  }

  invalidate() {
    this.cache.invalidate()
  }
}
