import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

import { EmailSenderType } from '@/services/email'

import { createPgEnum } from '../utils'

export const emailSenderProfileEnum = createPgEnum(
  'email_sender_profile',
  EmailSenderType
)

export const emailSenderProfilesTable = pgTable('email_sender_profiles', {
  profile: emailSenderProfileEnum('profile')
    .primaryKey()
    .$type<EmailSenderType>(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const socialLinksTable = pgTable(
  'social_links',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => sql`uuidv7()`),
    network: varchar('network', { length: 50 }).notNull(),
    url: text('url').notNull(),
    svg: text('svg').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [uniqueIndex('unique_social_link_network').on(table.network)]
)
