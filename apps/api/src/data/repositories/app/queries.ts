import { asc, eq, sql } from 'drizzle-orm'

import type { Database } from '../../clients'
import type { SocialLink } from './types'

import { db } from '../../clients'
import { socialLinksTable } from '../../schema'

export const findAllSocialLinks = async (
  tx?: Database
): Promise<SocialLink[]> => {
  const executor = tx || db

  return executor
    .select()
    .from(socialLinksTable)
    .orderBy(asc(sql`lower(${socialLinksTable.name})`))
}

export const findSocialLinkById = async (
  id: string,
  tx?: Database
): Promise<SocialLink | undefined> => {
  const executor = tx || db

  const [link] = await executor
    .select()
    .from(socialLinksTable)
    .where(eq(socialLinksTable.id, id))

  return link
}
