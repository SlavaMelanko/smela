import type {
  EmailSenderProfile,
  EmailSenderProfileProvider,
  EmailSenderProfiles
} from '@/emails'

import { systemRepo } from '@/data'
import { EmailSenderType } from '@/emails'
import { logger } from '@/logging'
import { TtlCache } from '@/utils/ttl-cache'

const loadProfiles = async (): Promise<EmailSenderProfiles> => {
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

  async get(profile: EmailSenderType): Promise<EmailSenderProfile> {
    const profiles = await this.cache.get()

    const sender = profiles.get(profile) ?? profiles.get(EmailSenderType.System)

    if (!sender) {
      throw new Error(`No email sender profile found for: ${profile}`)
    }

    return sender
  }

  invalidate() {
    this.cache.invalidate()
  }
}
