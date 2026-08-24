import type { emailSenderProfilesTable, socialLinksTable } from '../../schema'

// Database type
export type EmailSenderProfileRecord =
  typeof emailSenderProfilesTable.$inferSelect

// Input types for create / update / delete / etc
export type CreateEmailSenderProfileInput =
  typeof emailSenderProfilesTable.$inferInsert

export type UpdateEmailSenderProfileInput = Partial<
  Omit<CreateEmailSenderProfileInput, 'profile' | 'createdAt'>
>

// Database type
export type SocialLinkRecord = typeof socialLinksTable.$inferSelect

// Input types for create / update / delete / etc
export type CreateSocialLinkInput = typeof socialLinksTable.$inferInsert
