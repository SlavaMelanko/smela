import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export const ChevronIcon = ({ className }) => {
  return (
    <ChevronDown
      className={cn(
        'size-4 shrink-0 transition-transform duration-300',
        className
      )}
    />
  )
}
