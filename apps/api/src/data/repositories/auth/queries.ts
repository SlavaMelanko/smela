import { and, eq } from 'drizzle-orm'

import type { AuthProvider } from '@/types'

import type { Database } from '../../clients'
import type { Auth } from './types'

import { db } from '../../clients'
import { authTable } from '../../schema'

export const findByUserId = async (
  userId: string,
  tx?: Database
): Promise<Auth | undefined> => {
  const executor = tx || db

  const [foundAuth] = await executor
    .select()
    .from(authTable)
    .where(eq(authTable.userId, userId))

  return foundAuth
}

export const findByProvider = async (
  provider: AuthProvider,
  identifier: string,
  tx?: Database
): Promise<Auth | undefined> => {
  const executor = tx || db

  const [foundAuth] = await executor
    .select()
    .from(authTable)
    .where(
      and(
        eq(authTable.provider, provider),
        eq(authTable.identifier, identifier)
      )
    )

  return foundAuth
}
