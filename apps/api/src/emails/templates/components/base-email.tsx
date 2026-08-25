/** @jsxImportSource react */

import { Body, Container, Head, Html, Preview } from '@react-email/components'

import type { SocialLink } from '../../social-links'
import type { ThemeStyles } from '../../styles'

import { Footer, Header } from '.'
import { getThemeStyles } from '../../styles'

export interface Props {
  subject: string
  previewText: string
  styles: ThemeStyles
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
        <Footer styles={styles} socialLinks={socialLinks} />
      </Body>
    </Html>
  )
}

BaseEmail.PreviewProps = {
  subject: 'Email Subject',
  previewText: 'Email Preview Text',
  styles: getThemeStyles('light')
} as Props

export default BaseEmail
