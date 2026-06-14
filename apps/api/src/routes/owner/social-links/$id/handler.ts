import { HttpStatus } from '@/net/http'
import { deleteSocialLink, updateSocialLink } from '@/use-cases/owner'

import type { DeleteSocialLinkCtx, UpdateSocialLinkCtx } from './schema'

export const updateSocialLinkHandler = async (c: UpdateSocialLinkCtx) => {
  const { socialLinkId } = c.req.valid('param')
  const updates = c.req.valid('json')

  const socialLink = await updateSocialLink(socialLinkId, updates)

  return c.json(socialLink, HttpStatus.OK)
}

export const deleteSocialLinkHandler = async (c: DeleteSocialLinkCtx) => {
  const { socialLinkId } = c.req.valid('param')

  await deleteSocialLink(socialLinkId)

  return c.body(null, HttpStatus.NO_CONTENT)
}
