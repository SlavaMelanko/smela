import { z } from 'zod'

import { rules } from '@/routes/rules'

export const checkInviteQuerySchema = z.object({
  token: rules.token.oneTime
})
