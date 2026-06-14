import { z } from 'zod'

import type {
  ValidatedParamCtx,
  ValidatedParamJsonCtx
} from '@/routes/validated-ctx'

import { rules } from '@/routes/rules'

export const socialLinkIdParamsSchema = z.object({
  socialLinkId: rules.socialLink.id
})

export const updateSocialLinkBodySchema = z
  .object({
    name: rules.socialLink.name.optional(),
    url: rules.socialLink.url.optional(),
    icon: rules.socialLink.icon.optional()
  })
  .strict()

export type SocialLinkIdParams = z.infer<typeof socialLinkIdParamsSchema>
export type UpdateSocialLinkBody = z.infer<typeof updateSocialLinkBodySchema>

export type DeleteSocialLinkCtx = ValidatedParamCtx<SocialLinkIdParams>
export type UpdateSocialLinkCtx = ValidatedParamJsonCtx<
  SocialLinkIdParams,
  UpdateSocialLinkBody
>
