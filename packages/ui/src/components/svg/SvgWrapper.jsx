import { cn } from '@ui/lib/utils'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'

const sanitize = svg =>
  DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } })

export const SvgWrapper = ({ svg, size = 24, label, className, ...props }) => {
  const __html = useMemo(() => sanitize(svg), [svg])

  // Labeled icons expose a name to assistive tech; unlabeled ones are
  // decorative and hidden so they aren't announced as empty images.
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true }

  return (
    <span
      {...a11y}
      className={cn('inline-flex shrink-0 [&>svg]:size-full', className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html }}
      {...props}
    />
  )
}
