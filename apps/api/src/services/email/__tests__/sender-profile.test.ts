import { afterEach, describe, expect, it } from 'bun:test'

import type { EmailSenderProfileRecord } from '@/data'

import { ModuleMocker } from '@/__tests__'
import { EmailSenderProfile } from '@/types'

import { DatabaseEmailSenderProfileProvider } from '../sender-profile'

describe('DatabaseEmailSenderProfileProvider', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const records: Partial<Record<EmailSenderProfile, EmailSenderProfileRecord>> =
    {
      [EmailSenderProfile.System]: {
        profile: EmailSenderProfile.System,
        email: 'system@example.com',
        name: 'System',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      [EmailSenderProfile.Support]: {
        profile: EmailSenderProfile.Support,
        email: 'support@example.com',
        name: 'Support',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

  const mockRepo = async (
    findEmailSender: (
      profile: EmailSenderProfile
    ) => Promise<EmailSenderProfileRecord | undefined>
  ) =>
    moduleMocker.mock('@/data', () => ({
      systemRepo: { findEmailSender }
    }))

  const mockConfiguredProfiles = async () =>
    mockRepo(async profile => records[profile])

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('resolves the sender for a known profile', async () => {
    await mockConfiguredProfiles()
    const provider = new DatabaseEmailSenderProfileProvider()

    const sender = await provider.getSender(EmailSenderProfile.Support)

    expect(sender).toEqual({ email: 'support@example.com', name: 'Support' })
  })

  it('falls back to the system profile for an unknown profile', async () => {
    await mockConfiguredProfiles()
    const provider = new DatabaseEmailSenderProfileProvider()

    const sender = await provider.getSender(EmailSenderProfile.Security)

    expect(sender).toEqual({ email: 'system@example.com', name: 'System' })
  })

  it('throws when neither the profile nor the system fallback exist', async () => {
    await mockRepo(async () => undefined)
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
})
