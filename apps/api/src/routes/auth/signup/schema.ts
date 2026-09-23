import { z } from 'zod'

import { rules } from '@/routes/rules'

export const signupBodySchema = z
  .object({
    firstName: rules.user.firstName,
    lastName: rules.user.lastName.optional(),
    email: rules.user.email,
    password: rules.user.password,
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
