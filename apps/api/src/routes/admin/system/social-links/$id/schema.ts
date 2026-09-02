import { z } from 'zod'

import { rules } from '@/routes/rules'

export const socialLinkParamsSchema = z.object({
  id: rules.socialLink.id
})

export const updateSocialLinkBodySchema = z
  .object({
    name: rules.socialLink.name.optional(),
    url: rules.socialLink.url.optional(),
    svg: rules.socialLink.svg.optional()
  })
  .strict()
