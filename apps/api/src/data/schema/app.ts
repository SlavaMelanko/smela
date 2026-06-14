import { sql } from 'drizzle-orm'
import {
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

export const socialLinksTable = pgTable(
  'social_links',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => sql`uuidv7()`),
    name: varchar('name', { length: 32 }).notNull(),
    url: varchar('url', { length: 255 }).notNull(),
    icon: varchar('icon', { length: 32 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [uniqueIndex('social_links_name_unique').on(table.name)]
)
