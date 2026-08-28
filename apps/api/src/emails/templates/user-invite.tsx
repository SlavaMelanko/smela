/** @jsxImportSource react */

import { Link, Text } from '@react-email/components'

import type { CompanyProfile } from '../company'
import type { UserInviteContent } from '../content'
import type { SocialLink } from '../social-links'
import type { ThemeStyles } from '../styles'

import getContent from '../content'
import { getThemeStyles } from '../styles'
import { Signature } from './components'
import BaseEmail from './components/base-email'

interface Props {
  data: {
    firstName: string
    inviteUrl: string
    inviterName?: string
    teamName?: string
  }
  content: UserInviteContent
  styles: ThemeStyles
  company: CompanyProfile
  socialLinks?: SocialLink[]
}

const UserInviteEmail = ({
  data,
  content: c,
  styles: s,
  company,
  socialLinks
}: Props) => {
  const { firstName, inviteUrl, inviterName, teamName } = data

  return (
    <BaseEmail
      subject={c.subject(teamName)}
      previewText={c.previewText(teamName)}
      styles={s}
      company={company}
      socialLinks={socialLinks}
    >
      <Text style={s.text.body}>{c.greeting(firstName)}</Text>

      <Text style={s.text.body}>{c.body(inviterName, teamName)}</Text>

      <Text style={s.text.body}>{c.ctaInstruction}</Text>

      <Link href={inviteUrl} style={s.link}>
        {c.ctaText}
      </Link>

      <Text style={s.text.detail}>{`• ${c.expiryNotice}`}</Text>

      <Signature styles={s} signature={c.signature(company.name)} />
    </BaseEmail>
  )
}

UserInviteEmail.PreviewProps = {
  data: {
    firstName: 'Jason',
    inviteUrl: `http://localhost:5173/accept-invite?token=eb6a0c90a8e75d4c9d5a93def2911d7b`,
    inviterName: 'Alice',
    teamName: 'Acme Inc'
  },
  content: getContent('en').userInvite,
  styles: getThemeStyles('dark'),
  company: { name: 'SMELA' }
} as Props

export default UserInviteEmail
