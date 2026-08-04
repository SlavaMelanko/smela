import type { emailSenderProfilesTable } from '../../schema'

// Database types
export type EmailSenderProfileRecord =
  typeof emailSenderProfilesTable.$inferSelect

// Input types for create / update / delete / etc
export type CreateEmailSenderProfileInput =
  typeof emailSenderProfilesTable.$inferInsert

export type UpdateEmailSenderProfileInput = Partial<
  Omit<CreateEmailSenderProfileInput, 'profile' | 'createdAt'>
>
