import { eq } from 'drizzle-orm'

import type { EmailSenderProfile } from '@/types'

import type { Database } from '../../clients'
import type { EmailSenderProfileRecord } from './types'

import { db } from '../../clients'
import { emailSenderProfilesTable } from '../../schema'

export const findEmailSenderProfiles = async (
  tx?: Database
): Promise<EmailSenderProfileRecord[]> => {
  const executor = tx || db

  return executor.select().from(emailSenderProfilesTable)
}

export const findEmailSenderProfile = async (
  profile: EmailSenderProfile,
  tx?: Database
): Promise<EmailSenderProfileRecord | undefined> => {
  const executor = tx || db

  const [senderProfile] = await executor
    .select()
    .from(emailSenderProfilesTable)
    .where(eq(emailSenderProfilesTable.profile, profile))

  return senderProfile
}
