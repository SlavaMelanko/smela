import type { SocialLink, SocialLinksResolver } from '@smela/emails'

import { systemRepo } from '@/data'
import { logger } from '@/logging'
import { TtlCache } from '@/utils/ttl-cache'

const loadSocialLinks = async (): Promise<SocialLink[]> => {
  try {
    const records = await systemRepo.listSocialLinks()

    logger.debug({ count: records.length }, 'Loaded social links')

    return records.map(({ name, url, svg }) => ({ name, url, svg }))
  } catch (error) {
    logger.error({ error }, 'Failed to load social links')

    return []
  }
}

export class ApiSocialLinksResolver implements SocialLinksResolver {
  private readonly cache = new TtlCache(loadSocialLinks)

  async list(): Promise<SocialLink[]> {
    return this.cache.get()
  }

  invalidate() {
    this.cache.invalidate()
  }
}
