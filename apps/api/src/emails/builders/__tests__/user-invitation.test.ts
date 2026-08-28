import { describe, expect, it, mock } from 'bun:test'

import type {
  EmailSenderProfile,
  EmailSenderProfileResolver
} from '../../sender-profile'
import type { SocialLinksResolver } from '../../social-links'

import { EmailSenderType } from '../../sender-profile'
import { UserInvitationEmailMessageBuilder } from '../user-invitation'

const senderProfile: EmailSenderProfile = {
  email: 'support@smela.me',
  name: 'SMELA Support'
}

const buildSenderProfileResolver = (): EmailSenderProfileResolver => ({
  get: mock(async () => senderProfile),
  invalidate: mock(() => {})
})

const buildSocialLinksResolver = (): SocialLinksResolver => ({
  list: mock(async () => []),
  invalidate: mock(() => {})
})

describe('UserInvitationEmailMessageBuilder', () => {
  it('resolves the Support sender profile', async () => {
    const senderProfileResolver = buildSenderProfileResolver()

    const builder = new UserInvitationEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123',
      inviterName: 'Jane',
      teamName: 'Acme'
    })

    await builder.build(senderProfileResolver, buildSocialLinksResolver())

    expect(senderProfileResolver.get).toHaveBeenCalledWith(
      EmailSenderType.Support
    )
  })

  it('builds an email message addressed to the given recipient with the resolved sender', async () => {
    const builder = new UserInvitationEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123',
      inviterName: 'Jane',
      teamName: 'Acme'
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

  it('builds without the optional inviterName and teamName', async () => {
    const builder = new UserInvitationEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123'
    })

    const message = await builder.build(
      buildSenderProfileResolver(),
      buildSocialLinksResolver()
    )

    expect(message.to).toBe('user@example.com')
    expect(message.subject.length).toBeGreaterThan(0)
  })
})
