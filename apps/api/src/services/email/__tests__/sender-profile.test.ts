import { afterEach, describe, expect, it } from 'bun:test'

import { ModuleMocker } from '@/__tests__'

import { EnvSenderProfileProvider, SenderProfile } from '../sender-profile'

describe('EnvSenderProfileProvider', () => {
  const moduleMocker = new ModuleMocker(import.meta.url)

  const senderProfiles = {
    [SenderProfile.SYSTEM]: { email: 'system@example.com', name: 'System' },
    [SenderProfile.SUPPORT]: { email: 'support@example.com', name: 'Support' }
  }

  const mockEnv = async () => {
    await moduleMocker.mock('@/env', () => ({
      default: { EMAIL_SENDER_PROFILES: senderProfiles }
    }))
  }

  afterEach(async () => {
    await moduleMocker.clear()
  })

  it('resolves the sender for a known profile', async () => {
    await mockEnv()
    const provider = new EnvSenderProfileProvider()

    const sender = await provider.getSender(SenderProfile.SUPPORT)

    expect(sender).toEqual(senderProfiles[SenderProfile.SUPPORT])
  })

  it('falls back to the system profile for an unknown profile', async () => {
    await mockEnv()
    const provider = new EnvSenderProfileProvider()

    const sender = await provider.getSender(SenderProfile.SECURITY)

    expect(sender).toEqual(senderProfiles[SenderProfile.SYSTEM])
  })
})
