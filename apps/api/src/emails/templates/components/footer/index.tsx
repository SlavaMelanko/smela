/** @jsxImportSource react */

import type { SocialLink } from '../../../config'
import type { Metadata } from '../../../metadata'
import type { ThemeStyles } from '../../../styles'

import { config } from '../../../config'
import { getThemeStyles } from '../../../styles'
import Copyright from './copyright'
import MetadataContainer from './metadata'
import SocialLinks from './social-links'

interface Props {
  styles: ThemeStyles
  companyName?: string
  socialLinks?: SocialLink[]
  metadata?: Metadata
}

const Footer = ({
  styles,
  companyName = config.companyName,
  socialLinks = config.socialLinks,
  metadata
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
    <Copyright styles={styles} companyName={companyName} />
    {metadata && <MetadataContainer {...metadata} />}
  </div>
)

Footer.PreviewProps = {
  styles: getThemeStyles('light'),
  companyName: 'Company Name',
  socialLinks: [
    {
      name: 'facebook',
      url: 'https://facebook.com/your-profile',
      icon: 'facebook'
    },
    { name: 'github', url: 'https://github.com/your-profile', icon: 'github' },
    {
      name: 'linkedin',
      url: 'https://linkedin.com/in/your-profile',
      icon: 'linkedin'
    }
  ]
} as Props

export default Footer
