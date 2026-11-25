import { z } from 'zod'

import { rules } from '@/routes/rules'

export const checkInviteBodySchema = z
  .object({
    token: rules.token.oneTime
  })
  .strict()
