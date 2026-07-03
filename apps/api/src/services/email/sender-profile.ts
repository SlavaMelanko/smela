import env from '@/env'

export enum SenderProfile {
  SYSTEM = 'system',
  SUPPORT = 'support',
  SECURITY = 'security'
}

export interface EmailSender {
  email: string
  name: string
}

export interface SenderProfileProvider {
  getSender: (profile: SenderProfile) => Promise<EmailSender>
}

export class EnvSenderProfileProvider implements SenderProfileProvider {
  async getSender(profile: SenderProfile): Promise<EmailSender> {
    const profiles = env.EMAIL_SENDER_PROFILES
    const sender = profiles[profile] ?? profiles[SenderProfile.SYSTEM]

    return {
      email: sender.email,
      name: sender.name
    }
  }
}
