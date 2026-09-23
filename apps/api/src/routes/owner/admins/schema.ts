import { z } from 'zod'

import { rules } from '@/routes/rules'

export const getAdminsQuerySchema = z.object({
  search: rules.userFilter.search.optional(),
  statuses: rules.userFilter.statuses.optional(),
  ...rules.pagination
})

export const createAdminBodySchema = z
  .object({
    firstName: rules.user.firstName,
    lastName: rules.user.lastName.optional(),
    email: rules.user.email,
    permissions: rules.permissions
  })
  .strict()
