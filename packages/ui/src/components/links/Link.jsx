import { RouterLink } from '@ui/hooks/useRouter'
import { cn } from '@ui/lib/utils'

import { linkVariants } from './variants'

export const Link = ({
  to,
  className,
  size = 'default',
  underline = 'hover',
  openInNewTab,
  children,
  ...props
}) => {
  return (
    <RouterLink
      to={to}
      className={cn(linkVariants({ size, underline, className }))}
      {...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
    </RouterLink>
  )
}
