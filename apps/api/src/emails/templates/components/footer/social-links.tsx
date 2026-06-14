/** @jsxImportSource react */

import { Link } from '@react-email/components'

import type { SocialLink } from '../../../config'
import type { ThemeStyles } from '../../../styles'

import { getThemeStyles } from '../../../styles'

interface RenderedLink {
  href: string
  icon: React.ReactNode
  label: string
}

const getIcon = (
  platform: string,
  style: ThemeStyles['icon']
): React.ReactNode | null => {
  const icons: Record<string, React.ReactNode> = {
    facebook: (
      <svg
        style={style}
        viewBox='0 0 24 24'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path
          d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1
         0 0 1 1-1h3z'
        />
      </svg>
    ),
    github: (
      <svg
        style={style}
        viewBox='0 0 24 24'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' />
      </svg>
    ),
    linkedin: (
      <svg
        style={style}
        viewBox='0 0 24 24'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
        <rect x='2' y='9' width='4' height='12' />
        <circle cx='4' cy='4' r='2' />
      </svg>
    ),
    x: (
      <svg style={style} viewBox='0 0 24 24'>
        <path
          fill={style.stroke}
          stroke='none'
          d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99
         21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084
         4.126H5.117z'
        />
      </svg>
    )
  }

  return icons[platform.toLowerCase()] || null
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const mapIcons = (
  links: SocialLink[],
  style: ThemeStyles['icon']
): RenderedLink[] =>
  links.map(({ name, url, icon }) => ({
    href: url,
    icon: getIcon(icon, style),
    label: capitalize(name)
  }))

interface Props {
  styles: ThemeStyles
  socialLinks: SocialLink[]
}

const SocialLinks = ({ styles, socialLinks }: Props): React.ReactElement => {
  const links: RenderedLink[] = mapIcons(socialLinks, styles.icon)

  return (
    <div
      style={{
        display: 'flex',
        gap: styles.spacing.md
      }}
    >
      {links.map(({ href, icon, label }) => {
        if (!href || !icon) {
          return null
        }

        return (
          <Link key={label} href={href} aria-label={label}>
            {icon}
          </Link>
        )
      })}
    </div>
  )
}

SocialLinks.PreviewProps = {
  styles: getThemeStyles('light'),
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

export default SocialLinks
