import { eq } from 'drizzle-orm'

import { AppError, ErrorCode } from '@/errors'

import type { Database } from '../../clients'
import type {
  CreateSocialLinkInput,
  SocialLink,
  UpdateSocialLinkInput
} from './types'

import { db } from '../../clients'
import { socialLinksTable } from '../../schema'

// Postgres SQLSTATE for unique_violation
const UNIQUE_VIOLATION = '23505'

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: string }).code === UNIQUE_VIOLATION

export const createSocialLink = async (
  input: CreateSocialLinkInput,
  tx?: Database
): Promise<SocialLink> => {
  const executor = tx || db

  try {
    const [link] = await executor
      .insert(socialLinksTable)
      .values(input)
      .returning()

    if (!link) {
      throw new AppError(
        ErrorCode.InternalError,
        'Failed to create social link'
      )
    }

    return link
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(ErrorCode.Conflict, 'Social link name already exists')
    }

    throw error
  }
}

export const updateSocialLink = async (
  id: string,
  updates: UpdateSocialLinkInput,
  tx?: Database
): Promise<SocialLink> => {
  const executor = tx || db

  try {
    const [link] = await executor
      .update(socialLinksTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(socialLinksTable.id, id))
      .returning()

    if (!link) {
      throw new AppError(ErrorCode.NotFound, 'Social link not found')
    }

    return link
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError(ErrorCode.Conflict, 'Social link name already exists')
    }

    throw error
  }
}

export const deleteSocialLink = async (
  id: string,
  tx?: Database
): Promise<void> => {
  const executor = tx || db

  const [deleted] = await executor
    .delete(socialLinksTable)
    .where(eq(socialLinksTable.id, id))
    .returning({ id: socialLinksTable.id })

  if (!deleted) {
    throw new AppError(ErrorCode.NotFound, 'Social link not found')
  }
}
