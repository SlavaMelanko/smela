import type { CompanyProfile } from '../../company'

import type { UserInviteEmailData } from '../user-invite'
import { describe, expect, it } from 'bun:test'

import UserInviteEmailRenderer from '../user-invite'
import { testRendererContract } from './renderer-contract'

const renderer = new UserInviteEmailRenderer()

const INVITE_URL = 'https://example.com/accept-invite?token=abc123'

testRendererContract<UserInviteEmailData>({
  name: 'User invite',
  renderer,
  data: {
    firstName: 'John',
    inviteUrl: INVITE_URL,
    inviterName: 'Jane',
    teamName: 'Acme'
  },
  url: INVITE_URL,
  otherData: {
    firstName: 'Alice',
    inviteUrl: 'https://example.com/accept-invite?token=other',
    inviterName: 'Jane',
    teamName: 'Acme'
  },
  englishSubject: /invited/,
  ukrainianSubject: /запрошено/
})

describe('UserInviteEmailRenderer', () => {
  const company: CompanyProfile = { name: 'SMELA' }

  it('puts the team name in the subject and the inviter in the body', async () => {
    const result = await renderer.render(
      {
        firstName: 'John',
        inviteUrl: INVITE_URL,
        inviterName: 'Jane',
        teamName: 'Acme'
      },
      { company }
    )

    expect(result.subject).toContain('Acme')
    expect(result.html).toContain('Jane')
  })

  it('falls back to generic wording without an inviter or team name', async () => {
    const result = await renderer.render(
      { firstName: 'John', inviteUrl: INVITE_URL },
      { company }
    )

    expect(result.subject).toContain('the team')
    expect(result.html).toContain('Admin')
    expect(result.html).toContain(INVITE_URL)
  })
})
