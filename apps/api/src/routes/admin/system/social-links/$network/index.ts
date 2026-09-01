import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import { getSocialLink, updateSocialLink } from '@/use-cases/admin'

import { socialLinkParamsSchema, updateSocialLinkBodySchema } from './schema'

export const adminSocialLinkByNetworkRoute = new Hono<AppContext>()

adminSocialLinkByNetworkRoute.get(
  '/',
  validateParams(socialLinkParamsSchema),
  requirePermission(Permission.ViewSystem),
  async c => {
    const { network } = c.req.valid('param')

    const result = await getSocialLink(network)

    return c.json(result, HttpStatus.OK)
  }
)

adminSocialLinkByNetworkRoute.patch(
  '/',
  validateParams(socialLinkParamsSchema),
  validateBody(updateSocialLinkBodySchema),
  requirePermission(Permission.ManageSystem),
  async c => {
    const { network } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateSocialLink(network, body)

    return c.json(result, HttpStatus.OK)
  }
)
