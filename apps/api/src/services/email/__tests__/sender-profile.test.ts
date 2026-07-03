import { afterEach, describe, expect, it } from 'bun:test'

import type { SenderProfileRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { SenderProfile } from '@/types'

import { DatabaseSenderProfileProvider } from '../sender-profile'

describe('DatabaseSenderProfileProvider', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const records: Partial<Record<SenderProfile, SenderProfileRecord>> = {
    [SenderProfile.System]: {
      profile: SenderProfile.System,
      email: 'system@example.com',
      name: 'System',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    [SenderProfile.Support]: {
      profile: SenderProfile.Support,
      email: 'support@example.com',
      name: 'Support',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  const mockRepo = async (
    findSenderProfile: (
      profile: SenderProfile
    ) => Promise<SenderProfileRecord | undefined>
  ) =>
    moduleMocker.mock('@/data', () => ({
      systemRepo: { findSenderProfile }
    }))

  const mockConfiguredProfiles = async () =>
    mockRepo(async profile => records[profile])

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('resolves the sender for a known profile', async () => {
    await mockConfiguredProfiles()
    const provider = new DatabaseSenderProfileProvider()

    const sender = await provider.getSender(SenderProfile.Support)

    expect(sender).toEqual({ email: 'support@example.com', name: 'Support' })
  })

  it('falls back to the system profile for an unknown profile', async () => {
    await mockConfiguredProfiles()
    const provider = new DatabaseSenderProfileProvider()

    const sender = await provider.getSender(SenderProfile.Security)

    expect(sender).toEqual({ email: 'system@example.com', name: 'System' })
  })

  it('throws when neither the profile nor the system fallback exist', async () => {
    await mockRepo(async () => undefined)
    const provider = new DatabaseSenderProfileProvider()

    expect.hasAssertions()
    try {
      await provider.getSender(SenderProfile.Security)
    } catch (error) {
      expect((error as Error).message).toBe(
        'No sender profile found for: security'
      )
    }
  })
})
