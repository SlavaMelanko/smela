/** @jsxImportSource react */

import type { CompanyProfile } from '../../../company'
import type { SocialLink } from '../../../social-links'
import type { ThemeStyles } from '../../../styles'

import { getThemeStyles } from '../../../styles'
import Copyright from './copyright'
import MetadataContainer from './metadata'
import { previewSocialLinks } from './preview-social-links'
import SocialLinks from './social-links'

interface Props {
  styles: ThemeStyles
  company: CompanyProfile
  socialLinks?: SocialLink[]
}

const Footer = ({
  styles,
  company,
  socialLinks = []
}: Props): React.ReactElement => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <SocialLinks styles={styles} socialLinks={socialLinks} />
    <Copyright styles={styles} companyName={company.name} />
    <MetadataContainer />
  </div>
)

Footer.PreviewProps = {
  styles: getThemeStyles('light'),
  company: { name: 'Company Name' },
  socialLinks: previewSocialLinks
} as Props

export default Footer
