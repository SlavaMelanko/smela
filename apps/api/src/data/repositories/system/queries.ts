import type { Database } from '../../clients'
import type { EmailSenderProfileRecord } from './types'

import { db } from '../../clients'
import { emailSenderProfilesTable } from '../../schema'

export const findEmailSenderProfiles = async (
  tx?: Database
): Promise<EmailSenderProfileRecord[]> => {
  const executor = tx || db

  return executor.select().from(emailSenderProfilesTable)
}
