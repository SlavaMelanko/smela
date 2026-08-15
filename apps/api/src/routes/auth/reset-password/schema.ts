import { z } from 'zod'

import { rules } from '@/routes/rules'

export const resetPasswordBodySchema = z
  .object({
    token: rules.token.oneTime,
    password: rules.user.password
  })
  .strict()
