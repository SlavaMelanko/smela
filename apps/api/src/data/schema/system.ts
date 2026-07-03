import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { SenderProfile } from '@/types'

import { createPgEnum } from '../utils'

export const senderProfileEnum = createPgEnum('sender_profile', SenderProfile)

export const senderProfilesTable = pgTable('sender_profiles', {
  profile: senderProfileEnum('profile').primaryKey().$type<SenderProfile>(),
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
