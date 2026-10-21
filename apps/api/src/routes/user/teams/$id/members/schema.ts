import { z } from 'zod'

import { rules } from '@/routes/rules'

export const teamIdParamsSchema = z.object({
  teamId: rules.team.id
})

export const inviteMemberBodySchema = z
  .object({
    nickname: rules.user.nickname.optional(),
    firstName: rules.user.firstName.optional(),
    lastName: rules.user.lastName.optional(),
    email: rules.user.email,
    position: rules.team.position.optional(),
    permissions: rules.permissions
  })
  .strict()
