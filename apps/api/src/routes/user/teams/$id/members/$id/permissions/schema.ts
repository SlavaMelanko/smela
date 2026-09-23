import { z } from 'zod'

import { rules } from '@/routes/rules'

export const memberPermissionsParamsSchema = z.object({
  teamId: rules.team.id,
  memberId: rules.user.id
})

export const updateMemberPermissionsBodySchema = z
  .object({
    permissions: rules.permissions
  })
  .strict()
