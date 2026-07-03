import { eq } from 'drizzle-orm'

import type { SenderProfile } from '@/types'

import type { Database } from '../../clients'
import type { SenderProfileRecord } from './types'

import { db } from '../../clients'
import { senderProfilesTable } from '../../schema'

export const findSenderProfile = async (
  profile: SenderProfile,
  tx?: Database
): Promise<SenderProfileRecord | undefined> => {
  const executor = tx || db

  const [record] = await executor
    .select()
    .from(senderProfilesTable)
    .where(eq(senderProfilesTable.profile, profile))

  return record
}
