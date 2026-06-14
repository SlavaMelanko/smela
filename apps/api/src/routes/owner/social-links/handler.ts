import type { AppCtx } from '@/routes/validated-ctx'

import { HttpStatus } from '@/net/http'
import { createSocialLink, getSocialLinks } from '@/use-cases/owner'

import type { CreateSocialLinkCtx } from './schema'

export const getSocialLinksHandler = async (c: AppCtx) => {
  const socialLinks = await getSocialLinks()

  return c.json({ socialLinks }, HttpStatus.OK)
}

export const createSocialLinkHandler = async (c: CreateSocialLinkCtx) => {
  const body = c.req.valid('json')

  const socialLink = await createSocialLink(body)

  return c.json(socialLink, HttpStatus.CREATED)
}
