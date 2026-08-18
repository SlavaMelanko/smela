import { z } from 'zod'

import { rules } from '@/routes/rules'

export const memberIdParamsSchema = z.object({
  teamId: rules.team.id,
  memberId: rules.user.id
})

export const updateTeamMemberBodySchema = z
  .object({
    membership: z
      .object({
        position: rules.team.position.nullish()
      })
      .optional(),
    member: z
      .object({
        firstName: rules.user.firstName.optional(),
        lastName: rules.user.lastName.optional()
      })
      .optional()
  })
  .strict()
