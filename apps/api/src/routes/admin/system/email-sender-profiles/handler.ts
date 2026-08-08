import type { AppCtx } from '@/routes/validated-ctx'

import { HttpStatus } from '@/net/http'
import { getEmailSenderProfiles } from '@/use-cases/admin'

export const getEmailSenderProfilesHandler = async (c: AppCtx) => {
  const result = await getEmailSenderProfiles()

  return c.json(result, HttpStatus.OK)
}
