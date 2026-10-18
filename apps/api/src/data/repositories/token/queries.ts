import { eq } from 'drizzle-orm'

import type { Database } from '../../clients'
import type { Token } from './types'

import { db } from '../../clients'
import { tokensTable } from '../../schema'

export const findByTokenHash = async (
  tokenHash: string,
  tx?: Database
): Promise<Token | undefined> => {
  const executor = tx || db

  const [foundToken] = await executor
    .select()
    .from(tokensTable)
    .where(eq(tokensTable.tokenHash, tokenHash))

  return foundToken
}
