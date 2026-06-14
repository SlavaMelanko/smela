import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody, validateParams } from '@/middleware'

import { deleteSocialLinkHandler, updateSocialLinkHandler } from './handler'
import { socialLinkIdParamsSchema, updateSocialLinkBodySchema } from './schema'

export const ownerSocialLinkByIdRoute = new Hono<AppContext>()

ownerSocialLinkByIdRoute.patch(
  '/',
  validateParams(socialLinkIdParamsSchema),
  validateBody(updateSocialLinkBodySchema),
  updateSocialLinkHandler
)

ownerSocialLinkByIdRoute.delete(
  '/',
  validateParams(socialLinkIdParamsSchema),
  deleteSocialLinkHandler
)
