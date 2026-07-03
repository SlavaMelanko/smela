import type { senderProfilesTable } from '../../schema'

export type SenderProfileRecord = typeof senderProfilesTable.$inferSelect

export type CreateSenderProfileInput = typeof senderProfilesTable.$inferInsert
