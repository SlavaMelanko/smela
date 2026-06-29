import { cn } from '@ui/lib/utils'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'

const sanitize = svg =>
  DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } })

export const SvgWrapper = ({ svg, size = 24, className, ...props }) => {
  const __html = useMemo(() => sanitize(svg), [svg])

  return (
    <span
      role='img'
      className={cn('inline-flex shrink-0 [&>svg]:size-full', className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html }}
      {...props}
    />
  )
}
