import { z } from 'zod'

import { rules } from '@/routes/rules'

export const teamIdParamsSchema = z.object({
  teamId: rules.team.id
})

export const updateTeamBodySchema = z
  .object({
    name: rules.team.name.optional(),
    website: rules.team.website.optional(),
    description: rules.team.description.nullish()
  })
  .strict()
