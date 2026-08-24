import { afterEach, describe, expect, it, setSystemTime } from 'bun:test'

import type { SocialLinkRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'

import { DatabaseSocialLinksProvider } from '../social-links'

const ONE_HOUR_MS = 60 * 60 * 1000

describe('DatabaseSocialLinksProvider', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const record = (
    network: string,
    url: string,
    svg: string
  ): SocialLinkRecord => ({
    id: crypto.randomUUID(),
    network,
    url,
    svg,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const records = [
    record('facebook', 'https://facebook.com/example', '<svg>facebook</svg>'),
    record('github', 'https://github.com/example', '<svg>github</svg>')
  ]

  const mockRepo = async (findSocialLinks: () => Promise<SocialLinkRecord[]>) =>
    moduleMocker.mock('@/data', () => ({
      systemRepo: { findSocialLinks }
    }))

  const mockCountedRepo = async (rows = records) => {
    let queries = 0
    await mockRepo(async () => {
      queries++

      return rows
    })

    return () => queries
  }

  afterEach(async () => {
    setSystemTime()
    await moduleMocker.clear()
  })

  it('resolves social links from the database', async () => {
    await mockCountedRepo()
    const provider = new DatabaseSocialLinksProvider()

    const socialLinks = await provider.getSocialLinks()

    expect(socialLinks).toEqual([
      {
        network: 'facebook',
        url: 'https://facebook.com/example',
        svg: '<svg>facebook</svg>'
      },
      {
        network: 'github',
        url: 'https://github.com/example',
        svg: '<svg>github</svg>'
      }
    ])
  })

  it('returns an empty array when no social links exist', async () => {
    await mockRepo(async () => [])
    const provider = new DatabaseSocialLinksProvider()

    const socialLinks = await provider.getSocialLinks()

    expect(socialLinks).toEqual([])
  })

  it('returns an empty array when the database query fails', async () => {
    await mockRepo(async () => {
      throw new Error('Database unavailable')
    })
    const provider = new DatabaseSocialLinksProvider()

    const socialLinks = await provider.getSocialLinks()

    expect(socialLinks).toEqual([])
  })

  it('serves repeated lookups from the cache within the TTL', async () => {
    const queries = await mockCountedRepo()
    const provider = new DatabaseSocialLinksProvider()

    await provider.getSocialLinks()
    await provider.getSocialLinks()

    expect(queries()).toBe(1)
  })

  it('reloads from the database after the TTL expires', async () => {
    setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const queries = await mockCountedRepo()
    const provider = new DatabaseSocialLinksProvider()

    await provider.getSocialLinks()
    setSystemTime(new Date(Date.now() + ONE_HOUR_MS))
    await provider.getSocialLinks()

    expect(queries()).toBe(2)
  })

  it('reloads from the database after being invalidated within the TTL', async () => {
    const queries = await mockCountedRepo()
    const provider = new DatabaseSocialLinksProvider()

    await provider.getSocialLinks()
    provider.invalidate()
    await provider.getSocialLinks()

    expect(queries()).toBe(2)
  })

  it('serves the updated social links after being invalidated', async () => {
    let rows = [
      record('facebook', 'https://facebook.com/old', '<svg>old</svg>')
    ]
    await mockRepo(async () => rows)
    const provider = new DatabaseSocialLinksProvider()

    await provider.getSocialLinks()
    rows = [record('facebook', 'https://facebook.com/new', '<svg>new</svg>')]
    provider.invalidate()

    const socialLinks = await provider.getSocialLinks()

    expect(socialLinks[0].url).toBe('https://facebook.com/new')
  })
})
