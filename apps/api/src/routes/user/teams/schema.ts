import { z } from 'zod'

import { rules } from '@/routes/rules'

export const createTeamBodySchema = z
  .object({
    name: rules.team.name,
    website: rules.team.website,
    description: rules.team.description.optional()
  })
  .strict()
