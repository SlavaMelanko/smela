import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { EmailSenderProfile } from '@/types'

import { createPgEnum } from '../utils'

export const emailSenderProfileEnum = createPgEnum(
  'email_sender_profile',
  EmailSenderProfile
)

export const emailSenderProfilesTable = pgTable('email_sender_profiles', {
  profile: emailSenderProfileEnum('profile')
    .primaryKey()
    .$type<EmailSenderProfile>(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})
