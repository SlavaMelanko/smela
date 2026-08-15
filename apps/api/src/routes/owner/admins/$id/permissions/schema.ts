import { z } from 'zod'

import { rules } from '@/routes/rules'

export const adminIdParamsSchema = z.object({
  adminId: rules.user.id
})

export const updateAdminPermissionsBodySchema = z
  .object({
    permissions: rules.permissions
  })
  .strict()
