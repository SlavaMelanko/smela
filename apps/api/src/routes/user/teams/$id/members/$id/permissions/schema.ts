import { z } from 'zod'

import type {
  ValidatedParamCtx,
  ValidatedParamJsonCtx
} from '@/routes/validated-ctx'

import { rules } from '@/routes/rules'

export const memberPermissionsParamsSchema = z.object({
  teamId: rules.team.id,
  memberId: rules.user.id
})

export type MemberPermissionsParams = z.infer<
  typeof memberPermissionsParamsSchema
>
export type GetMemberPermissionsCtx = ValidatedParamCtx<MemberPermissionsParams>

export const updateMemberPermissionsBodySchema = z
  .object({
    permissions: rules.permissions
  })
  .strict()

export type UpdateMemberPermissionsBody = z.infer<
  typeof updateMemberPermissionsBodySchema
>
export type UpdateMemberPermissionsCtx = ValidatedParamJsonCtx<
  MemberPermissionsParams,
  UpdateMemberPermissionsBody
>
