import { z } from 'zod'

import { rules } from '@/routes/rules'

export const createSocialLinkBodySchema = z
  .object({
    name: rules.socialLink.name,
    url: rules.socialLink.url,
    svg: rules.socialLink.svg
  })
  .strict()
