import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { validateBody } from '@/middleware'
import { HttpStatus } from '@/net/http'
import { createTeam } from '@/use-cases/user'

import { teamByIdRoute } from './$id'
import { createTeamBodySchema } from './schema'

export const teamsRoute = new Hono<AppContext>()

teamsRoute.post('/teams', validateBody(createTeamBodySchema), async c => {
  const { id: userId } = c.get('user')
  const body = c.req.valid('json')

  const result = await createTeam(userId, body)

  return c.json(result, HttpStatus.CREATED)
})

teamsRoute.route('/teams/:teamId', teamByIdRoute)
