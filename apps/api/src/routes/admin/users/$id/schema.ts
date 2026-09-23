import { z } from 'zod'

import { rules } from '@/routes/rules'

export const userIdParamsSchema = z.object({
  id: rules.user.id
})

export const updateUserBodySchema = z
  .object({
    firstName: rules.user.firstName.optional(),
    lastName: rules.user.lastName.optional(),
    status: rules.user.status.optional()
  })
  .strict()
