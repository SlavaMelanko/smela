import type UserInviteContent from '../user-invite'

const DEFAULT_TEAM = 'the team'

export const content: UserInviteContent = {
  subject: (teamName?: string) =>
    `You're invited to ${teamName || DEFAULT_TEAM}`,
  previewText: (teamName?: string) =>
    `You're invited to ${teamName || DEFAULT_TEAM}`,
  greeting: (firstName?: string) => `Hi ${firstName || 'there'},`,
  body: (inviterName?: string, teamName?: string) =>
    `${inviterName || 'Admin'} invited you to join the ${teamName || DEFAULT_TEAM} team.`,
  ctaInstruction:
    'Click the link below to accept the invite and finish setting up your account:',
  ctaText: 'Accept invite',
  expiryNotice: 'This link expires in 24 hours for security reasons.',
  signature: (companyName: string) => ({
    thanks: 'Thanks,',
    who: `The ${companyName} Team`
  })
}

export default content
