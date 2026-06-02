import { AppError, ErrorCode } from '@/errors'
import { HttpStatus } from '@/net/http'
import { Permission } from '@/types'
import {
  cancelMemberInvite,
  removeTeamMember,
  resendMemberInvite,
  updateTeamMember
} from '@/use-cases/user'

import type { MemberIdCtx, UpdateTeamMemberCtx } from './schema'

export const getTeamMemberHandler = async (c: MemberIdCtx) => {
  const targetMember = c.get('targetMember')!

  return c.json({ member: targetMember }, HttpStatus.OK)
}

export const updateTeamMemberHandler = async (c: UpdateTeamMemberCtx) => {
  const { teamId, memberId } = c.req.valid('param')
  const body = c.req.valid('json')
  const { id: currentUserId, permissions } = c.get('user')

  const isSelf = currentUserId === memberId
  const canManage = permissions?.includes(Permission.ManageTeams) ?? false

  // Prevent self-updating users from changing membership fields (e.g. position)
  if (isSelf && !canManage && body.membership) {
    throw new AppError(ErrorCode.Forbidden)
  }

  const result = await updateTeamMember(teamId, memberId, body)

  return c.json(result, HttpStatus.OK)
}

export const resendMemberInviteHandler = async (c: MemberIdCtx) => {
  const team = c.get('team')!
  const targetMember = c.get('targetMember')!
  const { id: inviterId } = c.get('user')

  const result = await resendMemberInvite(team, targetMember, inviterId)

  return c.json(result, HttpStatus.OK)
}

export const removeTeamMemberHandler = async (c: MemberIdCtx) => {
  const { teamId, memberId } = c.req.valid('param')

  const result = await removeTeamMember(teamId, memberId)

  return c.json(result, HttpStatus.OK)
}

export const cancelMemberInviteHandler = async (c: MemberIdCtx) => {
  const targetMember = c.get('targetMember')!

  const result = await cancelMemberInvite(targetMember)

  return c.json(result, HttpStatus.OK)
}
