import { z } from 'zod'

import { rules } from '@/routes/rules'

export const loginBodySchema = z
  .object({
    email: rules.user.email,
    password: rules.user.password,
    captcha: z
      .object({
        token: rules.captcha.token
      })
      .strict()
  })
  .strict()
