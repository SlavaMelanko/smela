import { systemRepo } from '@/data'
import { EmailSenderProfile } from '@/types'

export { EmailSenderProfile }

export interface EmailSender {
  email: string
  name: string
}

export interface EmailSenderProfileProvider {
  getSender: (profile: EmailSenderProfile) => Promise<EmailSender>
}

export class DatabaseEmailSenderProfileProvider implements EmailSenderProfileProvider {
  async getSender(profile: EmailSenderProfile): Promise<EmailSender> {
    const record =
      (await systemRepo.findEmailSender(profile)) ??
      (await systemRepo.findEmailSender(EmailSenderProfile.System))

    if (!record) {
      throw new Error(`No email sender profile found for: ${profile}`)
    }

    return {
      email: record.email,
      name: record.name
    }
  }
}
