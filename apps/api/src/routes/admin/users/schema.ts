import { z } from 'zod'

import { rules } from '@/routes/rules'
import { Role } from '@/types'

export const getUsersQuerySchema = z.object({
  search: rules.userFilter.search.optional(),
  roles: rules.userFilter.roles.default([Role.User]),
  statuses: rules.userFilter.statuses.optional(),
  ...rules.pagination
})
