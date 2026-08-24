import type { SocialLink } from '@/emails'

import { systemRepo } from '@/data'

export type { SocialLink }

export interface SocialLinksProvider {
  getSocialLinks: () => Promise<SocialLink[]>
  invalidate: () => void
}

class InMemorySource {
  private static readonly TTL_MS = 60 * 60 * 1000 // 1 hour

  private links?: SocialLink[]
  private expiresAt = 0

  async get(): Promise<SocialLink[]> {
    if (!this.links || Date.now() >= this.expiresAt) {
      this.links = await this.load()
      this.expiresAt = Date.now() + InMemorySource.TTL_MS
    }

    return this.links
  }

  invalidate() {
    this.links = undefined
    this.expiresAt = 0
  }

  private async load(): Promise<SocialLink[]> {
    const records = await systemRepo.findSocialLinks()

    return records.map(({ network, url, svg }) => ({ network, url, svg }))
  }
}

export class DatabaseSocialLinksProvider implements SocialLinksProvider {
  private readonly source = new InMemorySource()

  async getSocialLinks(): Promise<SocialLink[]> {
    return this.source.get()
  }

  invalidate() {
    this.source.invalidate()
  }
}
