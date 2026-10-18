import type { UserPreferences } from '@/types'

import { db, userRepo } from '@/data'
import { TokenType } from '@/security/token'
import {
  buildVerificationUrl,
  emailService,
  VerificationEmailMessageBuilder
} from '@/services/email'
import { UserStatus } from '@/types'

import { issueOneTimeToken } from '../tokens'

export interface ResendVerificationEmailInput {
  email: string
}

export const resendVerificationEmail = async (
  { email }: ResendVerificationEmailInput,
  preferences?: UserPreferences
) => {
  const user = await userRepo.findByEmail(email)

  // Always return success to prevent email enumeration
  // Only send email if user exists and is unverified
  if (user?.status === UserStatus.New) {
    const token = await db.transaction(async tx =>
      issueOneTimeToken(user.id, TokenType.EmailVerification, tx)
    )

    void emailService.send(
      new VerificationEmailMessageBuilder(
        user.email,
        {
          firstName: user.firstName,
          verificationUrl: buildVerificationUrl(token)
        },
        preferences
      )
    )
  }

  return { success: true }
}
