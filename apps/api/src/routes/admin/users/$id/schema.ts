import { z } from 'zod'

import { rules } from '@/routes/rules'

export const userIdParamsSchema = z.object({
  id: rules.user.id
})

export const updateUserBodySchema = z
  .object({
    nickname: rules.user.nickname.optional(),
    firstName: rules.user.name.nullish(),
    lastName: rules.user.name.nullish(),
    status: rules.user.status.optional()
  })
  .strict()
