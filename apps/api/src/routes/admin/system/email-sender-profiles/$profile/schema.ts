import { z } from 'zod'

import { rules } from '@/routes/rules'

export const emailSenderProfileParamsSchema = z.object({
  profile: rules.emailSenderProfile.profile
})

export const updateEmailSenderProfileBodySchema = z
  .object({
    email: rules.emailSenderProfile.email.optional(),
    name: rules.emailSenderProfile.name.optional(),
    description: rules.emailSenderProfile.description.nullish()
  })
  .strict()
