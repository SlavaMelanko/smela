import { cn } from '@/lib/utils'

import { linkVariants } from './variants'

export const EmailLink = ({ email, className, size, underline, children }) => {
  return (
    <a
      href={`mailto:${email}`}
      className={cn(linkVariants({ size, underline, className }))}
    >
      {children ?? email}
    </a>
  )
}
