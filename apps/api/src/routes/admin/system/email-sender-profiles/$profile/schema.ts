import { z } from 'zod'

import type {
  ValidatedParamCtx,
  ValidatedParamJsonCtx
} from '@/routes/validated-ctx'

import { rules } from '@/routes/rules'

export const emailSenderProfileParamsSchema = z.object({
  profile: rules.emailSenderProfile.profile
})

export type EmailSenderProfileParams = z.infer<
  typeof emailSenderProfileParamsSchema
>
export type EmailSenderProfileCtx = ValidatedParamCtx<EmailSenderProfileParams>

export const updateEmailSenderProfileBodySchema = z
  .object({
    email: rules.emailSenderProfile.email.optional(),
    name: rules.emailSenderProfile.name.optional(),
    description: rules.emailSenderProfile.description.nullish()
  })
  .strict()

export type UpdateEmailSenderProfileBody = z.infer<
  typeof updateEmailSenderProfileBodySchema
>
export type UpdateEmailSenderProfileCtx = ValidatedParamJsonCtx<
  EmailSenderProfileParams,
  UpdateEmailSenderProfileBody
>
