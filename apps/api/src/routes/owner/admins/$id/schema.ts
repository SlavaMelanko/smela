import { z } from 'zod'

import { rules } from '@/routes/rules'

export const adminIdParamsSchema = z.object({
  adminId: rules.user.id
})

export const updateAdminBodySchema = z
  .object({
    firstName: rules.user.firstName.optional(),
    lastName: rules.user.lastName.optional(),
    status: rules.user.status.optional()
  })
  .strict()
