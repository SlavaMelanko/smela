import { z } from 'zod'

import { rules } from '@/routes/rules'

export const acceptInviteBodySchema = z
  .object({
    token: rules.token.oneTime,
    password: rules.user.password,
    nickname: rules.user.nickname.optional()
  })
  .strict()
