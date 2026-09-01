import { eq } from 'drizzle-orm'

import type { EmailSenderType } from '@/services/email'

import { AppError, ErrorCode } from '@/errors'

import type { Database } from '../../clients'
import type {
  EmailSenderProfileRecord,
  SocialLinkRecord,
  UpdateEmailSenderProfileInput,
  UpdateSocialLinkInput
} from './types'

import { db } from '../../clients'
import { emailSenderProfilesTable, socialLinksTable } from '../../schema'

export const updateEmailSenderProfile = async (
  profile: EmailSenderType,
  updates: UpdateEmailSenderProfileInput,
  tx?: Database
): Promise<EmailSenderProfileRecord> => {
  const executor = tx || db

  const [senderProfile] = await executor
    .update(emailSenderProfilesTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(emailSenderProfilesTable.profile, profile))
    .returning()

  if (!senderProfile) {
    throw new AppError(
      ErrorCode.InternalError,
      'Failed to update email sender profile'
    )
  }

  return senderProfile
}

export const updateSocialLink = async (
  id: string,
  updates: UpdateSocialLinkInput,
  tx?: Database
): Promise<SocialLinkRecord> => {
  const executor = tx || db

  const [socialLink] = await executor
    .update(socialLinksTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(socialLinksTable.id, id))
    .returning()

  if (!socialLink) {
    throw new AppError(ErrorCode.InternalError, 'Failed to update social link')
  }

  return socialLink
}
