import { describe, expect, it } from 'bun:test'

import type { CompanyProfile } from '../../company'
import type { EmailSenderProfile } from '../../sender-profile'

import { EmailSenderType } from '../../sender-profile'
import { UserInviteEmailMessageBuilder } from '../user-invite'
import {
  buildSenderProfileResolver,
  buildSocialLinksResolver
} from './resolvers'

const company: CompanyProfile = { name: 'SMELA' }

const senderProfile: EmailSenderProfile = {
  email: 'support@smela.me',
  name: 'SMELA Support'
}

describe('UserInviteEmailMessageBuilder', () => {
  it('resolves the Support sender profile', async () => {
    const senderProfileResolver = buildSenderProfileResolver(senderProfile)

    const builder = new UserInviteEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123',
      inviterName: 'Jane',
      teamName: 'Acme'
    })

    await builder.build(
      senderProfileResolver,
      buildSocialLinksResolver(),
      company
    )

    expect(senderProfileResolver.get).toHaveBeenCalledWith(
      EmailSenderType.Support
    )
  })

  it('builds an email message addressed to the given recipient with the resolved sender', async () => {
    const builder = new UserInviteEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123',
      inviterName: 'Jane',
      teamName: 'Acme'
    })

    const message = await builder.build(
      buildSenderProfileResolver(senderProfile),
      buildSocialLinksResolver(),
      company
    )

    expect(message.to).toBe('user@example.com')
    expect(message.from).toEqual(senderProfile)
    expect(message.subject.length).toBeGreaterThan(0)
    expect(message.html.length).toBeGreaterThan(0)
    expect(message.text.length).toBeGreaterThan(0)
  })

  it('builds without the optional inviterName and teamName', async () => {
    const builder = new UserInviteEmailMessageBuilder('user@example.com', {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123'
    })

    const message = await builder.build(
      buildSenderProfileResolver(senderProfile),
      buildSocialLinksResolver(),
      company
    )

    expect(message.to).toBe('user@example.com')
    expect(message.subject.length).toBeGreaterThan(0)
  })
})
