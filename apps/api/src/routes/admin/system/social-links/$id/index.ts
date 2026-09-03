import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { requirePermission, validateBody, validateParams } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import {
  deleteSocialLink,
  getSocialLink,
  updateSocialLink
} from '@/use-cases/admin'

import { socialLinkParamsSchema, updateSocialLinkBodySchema } from './schema'

export const adminSocialLinkByIdRoute = new Hono<AppContext>()

adminSocialLinkByIdRoute.get(
  '/',
  validateParams(socialLinkParamsSchema),
  requirePermission(Permission.ViewSystem),
  async c => {
    const { id } = c.req.valid('param')

    const result = await getSocialLink(id)

    return c.json(result, HttpStatus.OK)
  }
)

adminSocialLinkByIdRoute.patch(
  '/',
  validateParams(socialLinkParamsSchema),
  validateBody(updateSocialLinkBodySchema),
  requirePermission(Permission.ManageSystem),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await updateSocialLink(id, body)

    return c.json(result, HttpStatus.OK)
  }
)

adminSocialLinkByIdRoute.delete(
  '/',
  validateParams(socialLinkParamsSchema),
  requirePermission(Permission.ManageSystem),
  async c => {
    const { id } = c.req.valid('param')

    const result = await deleteSocialLink(id)

    return c.json(result, HttpStatus.OK)
  }
)
