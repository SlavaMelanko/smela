import { afterEach, describe, expect, it, setSystemTime } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { EmailSenderProfile } from '@/types'

import { DatabaseEmailSenderProfileProvider } from '../sender-profile'

const ONE_HOUR_MS = 60 * 60 * 1000

describe('DatabaseEmailSenderProfileProvider', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const record = (
    profile: EmailSenderProfile,
    email: string,
    name: string
  ): EmailSenderProfileRecord => ({
    profile,
    email,
    name,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const records = [
    record(EmailSenderProfile.System, 'system@example.com', 'System'),
    record(EmailSenderProfile.Support, 'support@example.com', 'Support')
  ]

  const mockRepo = async (
    findEmailSenderProfiles: () => Promise<EmailSenderProfileRecord[]>
  ) =>
    moduleMocker.mock('@/data', () => ({
      systemRepo: { findEmailSenderProfiles }
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

  it('resolves the sender for a known profile', async () => {
    await mockCountedRepo()
    const provider = new DatabaseEmailSenderProfileProvider()

    const sender = await provider.getSender(EmailSenderProfile.Support)

    expect(sender).toEqual({ email: 'support@example.com', name: 'Support' })
  })

  it('falls back to the system profile for an unknown profile', async () => {
    await mockCountedRepo()
    const provider = new DatabaseEmailSenderProfileProvider()

    const sender = await provider.getSender(EmailSenderProfile.Security)

    expect(sender).toEqual({ email: 'system@example.com', name: 'System' })
  })

  it('throws when neither the profile nor the system fallback exist', async () => {
    await mockRepo(async () => [])
    const provider = new DatabaseEmailSenderProfileProvider()

    expect.hasAssertions()
    try {
      await provider.getSender(EmailSenderProfile.Security)
    } catch (error) {
      expect((error as Error).message).toBe(
        'No email sender profile found for: security'
      )
    }
  })

  it('serves repeated lookups from the cache within the TTL', async () => {
    const queries = await mockCountedRepo()
    const provider = new DatabaseEmailSenderProfileProvider()

    await provider.getSender(EmailSenderProfile.Support)
    await provider.getSender(EmailSenderProfile.System)

    expect(queries()).toBe(1)
  })

  it('reloads from the database after the TTL expires', async () => {
    setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const queries = await mockCountedRepo()
    const provider = new DatabaseEmailSenderProfileProvider()

    await provider.getSender(EmailSenderProfile.Support)
    setSystemTime(new Date(Date.now() + ONE_HOUR_MS))
    await provider.getSender(EmailSenderProfile.Support)

    expect(queries()).toBe(2)
  })
})
