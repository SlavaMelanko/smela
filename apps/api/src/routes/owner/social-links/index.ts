import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'

import { ownerSocialLinkByIdRoute } from './$id'
import { createSocialLinkHandler, getSocialLinksHandler } from './handler'
import { createSocialLinkBodySchema } from './schema'

export const ownerSocialLinksRoute = new Hono<AppContext>()

ownerSocialLinksRoute.get('/social-links', getSocialLinksHandler)

ownerSocialLinksRoute.post(
  '/social-links',
  validateBody(createSocialLinkBodySchema),
  createSocialLinkHandler
)

ownerSocialLinksRoute.route(
  '/social-links/:socialLinkId',
  ownerSocialLinkByIdRoute
)
