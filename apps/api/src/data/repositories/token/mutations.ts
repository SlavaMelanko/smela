import { and, eq, isNull, sql } from 'drizzle-orm'

import { TokenStatus, TokenType } from '@/security/token'

import type { Database } from '../../clients'
import type { CreateTokenInput } from './types'

import { db } from '../../clients'
import { tokensTable } from '../../schema'

export const deprecateOldTokens = async (
  userId: string,
  tokenType: TokenType,
  tx?: Database
) => {
  const executor = tx || db

  await executor
    .update(tokensTable)
    .set({ status: TokenStatus.Deprecated })
    .where(
      and(
        eq(tokensTable.userId, userId),
        eq(tokensTable.type, tokenType),
        isNull(tokensTable.usedAt),
        eq(tokensTable.status, TokenStatus.Pending)
      )
    )
}

// Leaves the user's invites to other teams usable
export const deprecateTeamInviteTokens = async (
  userId: string,
  teamId: string,
  tx?: Database
) => {
  const executor = tx || db

  await executor
    .update(tokensTable)
    .set({ status: TokenStatus.Deprecated })
    .where(
      and(
        eq(tokensTable.userId, userId),
        eq(tokensTable.type, TokenType.UserInvite),
        eq(tokensTable.status, TokenStatus.Pending),
        sql`${tokensTable.metadata}->>'teamId' = ${teamId}`
      )
    )
}

export const createToken = async (
  token: CreateTokenInput,
  tx?: Database
): Promise<number> => {
  const executor = tx || db

  const [createdToken] = await executor
    .insert(tokensTable)
    .values({
      ...token,
      status: token.status || TokenStatus.Pending
    })
    .returning({ id: tokensTable.id })

  return createdToken.id
}

// Joins the caller's transaction when given, otherwise opens its own
export const issueToken = async (
  userId: string,
  token: CreateTokenInput,
  tx?: Database
): Promise<void> => {
  const run = async (executor: Database) => {
    await deprecateOldTokens(userId, token.type, executor)
    await createToken(token, executor)
  }

  return tx ? run(tx) : db.transaction(run)
}

// Conditional on Pending, so of two concurrent requests with the same token
// only one gets the row back
export const markTokenAsUsed = async (
  tokenId: number,
  tx?: Database
): Promise<boolean> => {
  const executor = tx || db

  const updated = await executor
    .update(tokensTable)
    .set({ status: TokenStatus.Used, usedAt: new Date() })
    .where(
      and(
        eq(tokensTable.id, tokenId),
        eq(tokensTable.status, TokenStatus.Pending)
      )
    )
    .returning({ id: tokensTable.id })

  return updated.length > 0
}
