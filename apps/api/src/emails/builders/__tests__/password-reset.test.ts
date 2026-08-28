import { describe, expect, it, mock } from 'bun:test'

import type {
  EmailSenderProfile,
  EmailSenderProfileResolver
} from '../../sender-profile'
import type { SocialLinksResolver } from '../../social-links'

import { EmailSenderType } from '../../sender-profile'
import { PasswordResetEmailMessageBuilder } from '../password-reset'

const senderProfile: EmailSenderProfile = {
  email: 'security@smela.me',
  name: 'SMELA Security'
}

const buildSenderProfileResolver = (): EmailSenderProfileResolver => ({
  get: mock(async () => senderProfile),
  invalidate: mock(() => {})
})

const buildSocialLinksResolver = (): SocialLinksResolver => ({
  list: mock(async () => []),
  invalidate: mock(() => {})
})

describe('PasswordResetEmailMessageBuilder', () => {
  it('resolves the Security sender profile', async () => {
    const senderProfileResolver = buildSenderProfileResolver()

    const builder = new PasswordResetEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      resetUrl: 'https://example.com/reset-password?token=xyz789'
    })

    await builder.build(senderProfileResolver, buildSocialLinksResolver())

    expect(senderProfileResolver.get).toHaveBeenCalledWith(
      EmailSenderType.Security
    )
  })

  it('builds an email message addressed to the given recipient with the resolved sender', async () => {
    const builder = new PasswordResetEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      resetUrl: 'https://example.com/reset-password?token=xyz789'
    })

    const message = await builder.build(
      buildSenderProfileResolver(),
      buildSocialLinksResolver()
    )

    expect(message.to).toBe('user@example.com')
    expect(message.from).toEqual(senderProfile)
    expect(message.subject.length).toBeGreaterThan(0)
    expect(message.html.length).toBeGreaterThan(0)
    expect(message.text.length).toBeGreaterThan(0)
  })
})
