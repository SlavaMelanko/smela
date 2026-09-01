import { z } from 'zod'

import { rules } from '@/routes/rules'

export const socialLinkParamsSchema = z.object({
  network: rules.socialLink.network
})

export const updateSocialLinkBodySchema = z
  .object({
    network: rules.socialLink.network.optional(),
    url: rules.socialLink.url.optional(),
    svg: rules.socialLink.svg.optional()
  })
  .strict()
