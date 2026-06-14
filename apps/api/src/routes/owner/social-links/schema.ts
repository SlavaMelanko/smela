import { z } from 'zod'

import type { ValidatedJsonCtx } from '@/routes/validated-ctx'

import { rules } from '@/routes/rules'

export const createSocialLinkBodySchema = z
  .object({
    name: rules.socialLink.name,
    url: rules.socialLink.url,
    icon: rules.socialLink.icon
  })
  .strict()

export type CreateSocialLinkBody = z.infer<typeof createSocialLinkBodySchema>
export type CreateSocialLinkCtx = ValidatedJsonCtx<CreateSocialLinkBody>
