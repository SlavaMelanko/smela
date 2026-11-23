import { beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { Action, Resource } from '@/types'

import type { Database } from '../../../clients'
import type { PermissionRecord } from '../types'

import * as schema from '../../../schema'
import {
  grantInitialMembershipPermissions,
  setMembershipPermissions
} from '../../team/mutations'
import { grantInitialUserPermissions, setUserPermissions } from '../mutations'

const catalog: PermissionRecord[] = [
  { id: 1, action: Action.View, resource: Resource.Users },
  { id: 2, action: Action.Manage, resource: Resource.Users },
  { id: 3, action: Action.View, resource: Resource.Teams },
  { id: 4, action: Action.Manage, resource: Resource.Teams }
]

const ownerId = '00000000-0000-0000-0000-000000000001'

// Stored as users:manage only, since manage implies view
const permissions = { [Resource.Users]: { [Action.Manage]: true } }

interface Statement {
  text: string
  values: unknown[]
}

// Stubs the PostgreSQL client, the only I/O boundary, and records every statement
const createRecordingDb = () => {
  const statements: Statement[] = []
  const pool = new Pool()

  const recordQuery = async (config: { text: string }, values: unknown[]) => {
    statements.push({ text: config.text, values })

    const rows = config.text.startsWith('select')
      ? catalog.map(({ id, action, resource }) => [id, action, resource])
      : []

    return { rows, rowCount: rows.length, fields: [] }
  }

  // A plain function can't implement every overload of pg's query signature
  spyOn(pool, 'query').mockImplementation(recordQuery as Pool['query'])

  const tx: Database = drizzle(pool, { schema, casing: 'snake_case' })

  return { statements, tx }
}

const writers = [
  {
    owner: 'user',
    table: 'user_permissions',
    ownerColumn: 'user_id',
    grantInitial: grantInitialUserPermissions,
    set: setUserPermissions
  },
  {
    owner: 'membership',
    table: 'membership_permissions',
    ownerColumn: 'membership_id',
    grantInitial: grantInitialMembershipPermissions,
    set: setMembershipPermissions
  }
]

describe.each(writers)(
  '$owner permission links',
  ({ table, ownerColumn, grantInitial, set }) => {
    let recording: ReturnType<typeof createRecordingDb>

    beforeEach(() => {
      recording = createRecordingDb()
    })

    const findStatement = (verb: string) =>
      recording.statements.find(({ text }) => text.startsWith(verb))

    it('grantInitial inserts granted permissions without deleting', async () => {
      await grantInitial(ownerId, permissions, recording.tx)

      const insert = findStatement('insert')

      expect(insert?.text).toContain(`insert into "${table}"`)
      expect(insert?.values).toEqual([ownerId, 2])
      expect(findStatement('delete')).toBeUndefined()
    })

    it('set inserts grants and deletes every other permission of the owner', async () => {
      await set(ownerId, permissions, recording.tx)

      const insert = findStatement('insert')
      const remove = findStatement('delete')

      expect(insert?.values).toEqual([ownerId, 2])
      expect(remove?.text).toContain(`delete from "${table}"`)
      expect(remove?.text).toContain(`"${table}"."${ownerColumn}" = $1`)
      expect(remove?.values).toEqual([ownerId, 1, 3, 4])
    })
  }
)
