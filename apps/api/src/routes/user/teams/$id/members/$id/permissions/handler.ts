import { HttpStatus } from '@/net/http'
import {
  getTeamMemberPermissions,
  updateTeamMemberPermissions
} from '@/use-cases/user'

import type {
  GetMemberPermissionsCtx,
  UpdateMemberPermissionsCtx
} from './schema'

export const getTeamMemberPermissionsHandler = async (
  c: GetMemberPermissionsCtx
) => {
  const { memberId } = c.req.valid('param')

  const result = await getTeamMemberPermissions(memberId)

  return c.json(result, HttpStatus.OK)
}

export const updateTeamMemberPermissionsHandler = async (
  c: UpdateMemberPermissionsCtx
) => {
  const { memberId } = c.req.valid('param')
  const { permissions } = c.req.valid('json')

  const result = await updateTeamMemberPermissions(memberId, permissions)

  return c.json(result, HttpStatus.OK)
}
