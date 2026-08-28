export enum EmailSenderType {
  System = 'system',
  Support = 'support',
  Security = 'security'
}

export interface EmailSenderProfile {
  email: string
  name: string
}

export type EmailSenderProfiles = Map<EmailSenderType, EmailSenderProfile>

export interface EmailSenderProfileProvider {
  // Returns the profile for the given type, or a fallback if the requested type is not found.
  get: (profile: EmailSenderType) => Promise<EmailSenderProfile>

  // Drops any cached profiles so the next get() call reloads them.
  invalidate: () => void
}
