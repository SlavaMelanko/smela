import { and, eq } from 'drizzle-orm'

import type { AuthProvider } from '@/types'

import type { Database } from '../../clients'
import type { CreateAuthInput, UpdateAuthInput } from './types'

import { db } from '../../clients'
import { authTable } from '../../schema'

export const createAuth = async (
  auth: CreateAuthInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db

  await executor.insert(authTable).values(auth)
}

export const updateAuth = async (
  userId: string,
  updates: UpdateAuthInput,
  tx?: Database
): Promise<void> => {
  const executor = tx || db

  await executor
    .update(authTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(authTable.userId, userId))
}

export const deleteAuthByProvider = async (
  userId: string,
  provider: AuthProvider,
  tx?: Database
): Promise<void> => {
  const executor = tx || db

  await executor
    .delete(authTable)
    .where(and(eq(authTable.userId, userId), eq(authTable.provider, provider)))
}
