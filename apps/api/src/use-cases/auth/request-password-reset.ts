import type { UserPreferences } from '@/types'

import { db, userRepo } from '@/data'
import { TokenType } from '@/security/token'
import {
  buildResetPasswordUrl,
  emailService,
  PasswordResetEmailMessageBuilder
} from '@/services/email'
import { isActive } from '@/types'

import { issueOneTimeToken } from '../tokens'

export interface RequestPasswordResetInput {
  email: string
}

export const requestPasswordReset = async (
  { email }: RequestPasswordResetInput,
  preferences?: UserPreferences
) => {
  const user = await userRepo.findByEmail(email)

  // Always return success to prevent email enumeration
  // Only send email if user exists and is active
  if (user && isActive(user.status)) {
    const token = await db.transaction(async tx =>
      issueOneTimeToken(user.id, TokenType.PasswordReset, tx)
    )

    void emailService.send(
      new PasswordResetEmailMessageBuilder(
        user.email,
        {
          firstName: user.firstName,
          resetUrl: buildResetPasswordUrl(user.role, token)
        },
        preferences
      )
    )
  }

  return { success: true }
}
