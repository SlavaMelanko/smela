/** @jsxImportSource react */

import { Body, Container, Head, Html, Preview } from '@react-email/components'

import type { CompanyProfile } from '../../company'
import type { SocialLink } from '../../social-links'
import type { ThemeStyles } from '../../styles'

import { getThemeStyles } from '../../styles'
import Footer from './footer'
import Header from './header'

export interface Props {
  subject: string
  previewText: string
  styles: ThemeStyles
  company: CompanyProfile
  socialLinks?: SocialLink[]
  children: React.ReactNode
}

const getStyles = (styles: ThemeStyles) => ({
  main: {
    backgroundColor: styles.color.background.primary,
    fontFamily: styles.font.family.sans
  },
  container: {
    maxWidth: '580px',
    margin: '2rem auto',
    padding: styles.spacing.lg,
    backgroundColor: styles.color.background.secondary,
    borderRadius: styles.borderRadius.lg
  }
})

export const BaseEmail = ({
  subject,
  previewText,
  styles,
  company,
  socialLinks,
  children
}: Props) => {
  const emailStyles = getStyles(styles)

  return (
    <Html style={{ backgroundColor: styles.color.background.primary }}>
      <Head>
        <title>{subject}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          <Header styles={styles} />
          {children}
        </Container>
        <Footer styles={styles} company={company} socialLinks={socialLinks} />
      </Body>
    </Html>
  )
}

BaseEmail.PreviewProps = {
  subject: 'Email Subject',
  previewText: 'Email Preview Text',
  styles: getThemeStyles('light'),
  company: { name: 'Company Name' }
} as Props

export default BaseEmail
