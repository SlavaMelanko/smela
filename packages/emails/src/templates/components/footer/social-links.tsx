/** @jsxImportSource react */

import type { SocialLink } from '../../../social-links'

import type { ThemeStyles } from '../../../styles'
import { Link } from '@react-email/components'

import { getThemeStyles } from '../../../styles'
import { previewSocialLinks } from './preview-social-links'

interface Props {
  styles: ThemeStyles
  socialLinks: SocialLink[]
}

// Stored SVGs carry a viewBox but no width/height, which leaves them with no
// intrinsic size in email clients. Sizing the anchor and forcing the nested svg
// to fill it keeps the icons visible without depending on flex layout
const iconSize = '24px'

const withSizedSvg = (svg: string): string =>
  svg.replace('<svg', `<svg width="${iconSize}" height="${iconSize}"`)

// Stored SVGs are expected to use stroke/fill="currentColor" so styles.icon's
// color applies via inheritance from the wrapping span
const SocialLinks = ({ styles, socialLinks }: Props): React.ReactElement => (
  <div>
    {socialLinks.map(({ name, url, svg }) => {
      if (!url || !svg) {
        return null
      }

      return (
        <Link
          key={name}
          href={url}
          aria-label={name}
          style={{
            display: 'inline-block',
            marginRight: styles.spacing.md,
            color: styles.icon.color
          }}
        >
          {/* svg is admin-authored today; sanitize at the write boundary once a mutation route exists */}
          <span
            style={styles.icon}
            dangerouslySetInnerHTML={{ __html: withSizedSvg(svg) }}
          />
        </Link>
      )
    })}
  </div>
)

SocialLinks.PreviewProps = {
  styles: getThemeStyles('light'),
  socialLinks: previewSocialLinks
}

export default SocialLinks
