import { systemRepo } from '@/data'
import { EmailSenderProfile } from '@/types'

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

class InMemorySource {
  private static readonly TTL_MS = 60 * 60 * 1000 // 1 hour

  private senders?: EmailSenders
  private expiresAt = 0

  async get(): Promise<EmailSenders> {
    if (!this.senders || Date.now() >= this.expiresAt) {
      this.senders = await this.load()
      this.expiresAt = Date.now() + InMemorySource.TTL_MS
    }

    return this.senders
  }

  invalidate() {
    this.senders = undefined
    this.expiresAt = 0
  }

  private async load(): Promise<EmailSenders> {
    const records = await systemRepo.findEmailSenderProfiles()

    return new Map(
      records.map(({ profile, email, name }) => [profile, { email, name }])
    )
  }
}

export class DatabaseEmailSenderProfileProvider implements EmailSenderProfileProvider {
  private readonly source = new InMemorySource()

  async getSender(profile: EmailSenderProfile): Promise<EmailSender> {
    const senders = await this.source.get()

    const sender =
      senders.get(profile) ?? senders.get(EmailSenderProfile.System)

    if (!sender) {
      throw new Error(`No email sender profile found for: ${profile}`)
    }

    return sender
  }

  invalidate() {
    this.source.invalidate()
  }
}
