import type { emailSenderProfilesTable } from '../../schema'

export type EmailSenderProfileRecord =
  typeof emailSenderProfilesTable.$inferSelect

export type CreateEmailSenderProfileInput =
  typeof emailSenderProfilesTable.$inferInsert
