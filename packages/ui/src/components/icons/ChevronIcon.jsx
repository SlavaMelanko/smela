import { cn } from '@ui/lib/utils'
import { ChevronDown } from 'lucide-react'

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
