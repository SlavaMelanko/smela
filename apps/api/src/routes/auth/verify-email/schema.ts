import { z } from 'zod'

import { rules } from '@/routes/rules'

export const verifyEmailBodySchema = z
  .object({
    token: rules.token.oneTime
  })
  .strict()
