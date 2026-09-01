import { eq } from 'drizzle-orm'

import type { EmailSenderType } from '@/services/email'

import type { Database } from '../../clients'
import type { EmailSenderProfileRecord, SocialLinkRecord } from './types'

import { db } from '../../clients'
import { emailSenderProfilesTable, socialLinksTable } from '../../schema'

export const listEmailSenderProfiles = async (
  tx?: Database
): Promise<EmailSenderProfileRecord[]> => {
  const executor = tx || db

  return executor.select().from(emailSenderProfilesTable)
}

export const findEmailSenderProfile = async (
  profile: EmailSenderType,
  tx?: Database
): Promise<EmailSenderProfileRecord | undefined> => {
  const executor = tx || db

  const [senderProfile] = await executor
    .select()
    .from(emailSenderProfilesTable)
    .where(eq(emailSenderProfilesTable.profile, profile))

  return senderProfile
}

export const listSocialLinks = async (
  tx?: Database
): Promise<SocialLinkRecord[]> => {
  const executor = tx || db

  return executor.select().from(socialLinksTable)
}

export const findSocialLink = async (
  id: string,
  tx?: Database
): Promise<SocialLinkRecord | undefined> => {
  const executor = tx || db

  const [socialLink] = await executor
    .select()
    .from(socialLinksTable)
    .where(eq(socialLinksTable.id, id))

  return socialLink
}
