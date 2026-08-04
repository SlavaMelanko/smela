import { HttpStatus } from '@/net/http'
import {
  getEmailSenderProfile,
  updateEmailSenderProfile
} from '@/use-cases/admin'

import type {
  EmailSenderProfileCtx,
  UpdateEmailSenderProfileCtx
} from './schema'

export const getEmailSenderProfileHandler = async (
  c: EmailSenderProfileCtx
) => {
  const { profile } = c.req.valid('param')

  const result = await getEmailSenderProfile(profile)

  return c.json(result, HttpStatus.OK)
}

export const updateEmailSenderProfileHandler = async (
  c: UpdateEmailSenderProfileCtx
) => {
  const { profile } = c.req.valid('param')
  const body = c.req.valid('json')

  const result = await updateEmailSenderProfile(profile, body)

  return c.json(result, HttpStatus.OK)
}
