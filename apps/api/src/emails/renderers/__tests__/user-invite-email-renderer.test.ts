import { describe, expect, it } from 'bun:test'

import type { SocialLink } from '../../social-links'
import type { UserPreferences } from '../../user-preferences'
import type { UserInviteEmailData } from '../user-invite'

import UserInviteEmailRenderer from '../user-invite'

describe('User Invitation Email Renderer', () => {
  const renderer = new UserInviteEmailRenderer()

  const mockData: UserInviteEmailData = {
    firstName: 'John',
    inviteUrl: 'https://example.com/accept-invite?token=abc123',
    inviterName: 'Jane',
    teamName: 'Acme'
  }

  it('should render invite email with required fields', async () => {
    const result = await renderer.render(mockData)

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('html')
    expect(result).toHaveProperty('text')
    expect(result.subject.length).toBeGreaterThan(0)
    expect(result.html).toContain(mockData.firstName)
    expect(result.html).toContain(mockData.inviteUrl)
    expect(result.text).toContain(mockData.firstName)
    expect(result.text).toContain(mockData.inviteUrl)
  })

  it('should include the team name in the subject when provided', async () => {
    const result = await renderer.render(mockData)

    expect(result.subject).toContain('Acme')
  })

  it('should render without inviterName or teamName', async () => {
    const dataWithoutOptionalFields: UserInviteEmailData = {
      firstName: 'John',
      inviteUrl: 'https://example.com/accept-invite?token=abc123'
    }

    const result = await renderer.render(dataWithoutOptionalFields)

    expect(result.subject.length).toBeGreaterThan(0)
    expect(result.html).toContain('John')
    expect(result.html).toContain(dataWithoutOptionalFields.inviteUrl)
  })

  it('should render with Ukrainian locale and different themes', async () => {
    const ukResult = await renderer.render(mockData, {
      locale: 'uk',
      theme: 'light'
    })
    const darkResult = await renderer.render(mockData, {
      locale: 'en',
      theme: 'dark'
    } satisfies UserPreferences)

    expect(ukResult.subject.length).toBeGreaterThan(0)
    expect(darkResult.html).toContain(mockData.firstName)
  })

  it('should include social links in the footer when provided', async () => {
    const mockSocialLinks: SocialLink[] = [
      {
        network: 'facebook',
        url: 'https://facebook.com/example',
        svg: '<svg><path d="M0 0" /></svg>'
      }
    ]

    const result = await renderer.render(mockData, undefined, mockSocialLinks)

    expect(result.html).toContain('https://facebook.com/example')
  })

  it('should not leak data between different invites', async () => {
    const inviteA: UserInviteEmailData = {
      firstName: 'Alice',
      inviteUrl: 'https://example.com/accept-invite?token=token1',
      teamName: 'Team A'
    }
    const inviteB: UserInviteEmailData = {
      firstName: 'Bob',
      inviteUrl: 'https://example.com/accept-invite?token=token2',
      teamName: 'Team B'
    }

    const resultA = await renderer.render(inviteA)
    const resultB = await renderer.render(inviteB)

    expect(resultA.html).toContain('Alice')
    expect(resultA.html).not.toContain('Bob')
    expect(resultB.html).toContain('Bob')
    expect(resultB.html).not.toContain('Alice')
  })
})
