import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

import { MembershipStatus } from '@/types'

import { createPgEnum } from '../utils'
import { permissionsTable } from './rbac'
import { usersTable } from './users'

export const membershipStatusEnum = createPgEnum(
  'membership_status',
  MembershipStatus
)

export const teamsTable = pgTable('teams', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => sql`uuidv7()`),
  name: varchar('name', { length: 255 }).notNull(),
  website: varchar('website', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => usersTable.id, {
    onDelete: 'set null'
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const membershipsTable = pgTable(
  'memberships',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => sql`uuidv7()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teamsTable.id, { onDelete: 'cascade' }),
    position: varchar('position', { length: 100 }),
    // Pending until the invited user accepts. A pending membership grants nothing
    status: membershipStatusEnum('status')
      .notNull()
      .default(MembershipStatus.Pending)
      .$type<MembershipStatus>(),
    invitedBy: uuid('invited_by').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    // The latest one is the user's active team
    lastActiveAt: timestamp('last_active_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  table => [
    uniqueIndex('unique_membership').on(table.userId, table.teamId),
    index('memberships_team_index').on(table.teamId)
  ]
)

export const membershipPermissionsTable = pgTable(
  'membership_permissions',
  {
    membershipId: uuid('membership_id')
      .notNull()
      .references(() => membershipsTable.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissionsTable.id, { onDelete: 'cascade' })
  },
  table => [primaryKey({ columns: [table.membershipId, table.permissionId] })]
)
