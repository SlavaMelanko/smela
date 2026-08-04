import { eq } from 'drizzle-orm'

import type { EmailSenderProfile } from '@/types'

import { AppError, ErrorCode } from '@/errors'

import type { Database } from '../../clients'
import type {
  EmailSenderProfileRecord,
  UpdateEmailSenderProfileInput
} from './types'

import { db } from '../../clients'
import { emailSenderProfilesTable } from '../../schema'

export const updateEmailSenderProfile = async (
  profile: EmailSenderProfile,
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
