import { z } from 'zod'

import { rules } from '@/routes/rules'

export const resendVerificationEmailBodySchema = z
  .object({
    email: rules.user.email,
    captcha: z
      .object({
        token: rules.captcha.token
      })
      .strict(),
    preferences: z
      .object({
        locale: rules.preferences.locale,
        theme: rules.preferences.theme
      })
      .strict()
      .optional()
  })
  .strict()
