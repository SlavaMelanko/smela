import type { SocialLink } from '@/emails'

import { systemRepo } from '@/data'
import { logger } from '@/logging'
import { hour } from '@/utils/chrono'
import { TtlCache } from '@/utils/ttl-cache'

export type { SocialLink }

export interface SocialLinksProvider {
  getSocialLinks: () => Promise<SocialLink[]>
  invalidate: () => void
}

const loadSocialLinks = async (): Promise<SocialLink[]> => {
  try {
    const records = await systemRepo.findSocialLinks()

    logger.debug({ count: records.length }, 'Loaded social links')

    return records.map(({ network, url, svg }) => ({ network, url, svg }))
  } catch (error) {
    logger.error({ error }, 'Failed to load social links')

    return []
  }
}

export class DatabaseSocialLinksProvider implements SocialLinksProvider {
  private readonly cache = new TtlCache(hour(), loadSocialLinks)

  async getSocialLinks(): Promise<SocialLink[]> {
    return this.cache.get()
  }

  invalidate() {
    this.cache.invalidate()
  }
}
