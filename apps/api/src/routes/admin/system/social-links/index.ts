import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { createSocialLink, getSocialLinks } from '@/use-cases/admin'

import { adminSocialLinkByIdRoute } from './$id'
import { createSocialLinkBodySchema } from './schema'

export const adminSocialLinksRoute = new Hono<AppContext>()

adminSocialLinksRoute.get(
  '/',
  requirePermission(Permission.ViewSystem),
  async c => {
    const result = await getSocialLinks()

    return c.json(result, HttpStatus.OK)
  }
)

adminSocialLinksRoute.post(
  '/',
  validateBody(createSocialLinkBodySchema),
  requirePermission(Permission.ManageSystem),
  async c => {
    const body = c.req.valid('json')

    const result = await createSocialLink(body)

    return c.json(result, HttpStatus.CREATED)
  }
)

adminSocialLinksRoute.route('/:id', adminSocialLinkByIdRoute)
