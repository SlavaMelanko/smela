export enum EmailSenderProfile {
  System = 'system',
  Support = 'support',
  Security = 'security'
}

export interface EmailSender {
  email: string
  name: string
}

export type EmailSenders = Map<EmailSenderProfile, EmailSender>

export interface EmailSenderProfileProvider {
  get: (profile: EmailSenderProfile) => Promise<EmailSender>
  invalidate: () => void
}
