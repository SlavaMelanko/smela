import { systemRepo } from '@/data'
import { SenderProfile } from '@/types'

export { SenderProfile }

export interface EmailSender {
  email: string
  name: string
}

export interface SenderProfileProvider {
  getSender: (profile: SenderProfile) => Promise<EmailSender>
}

export class DatabaseSenderProfileProvider implements SenderProfileProvider {
  async getSender(profile: SenderProfile): Promise<EmailSender> {
    const record =
      (await systemRepo.findSenderProfile(profile)) ??
      (await systemRepo.findSenderProfile(SenderProfile.System))

    if (!record) {
      throw new Error(`No sender profile found for: ${profile}`)
    }

    return {
      email: record.email,
      name: record.name
    }
  }
}
