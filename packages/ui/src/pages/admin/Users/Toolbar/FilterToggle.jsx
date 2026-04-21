import { ChevronIcon } from '@ui/components/icons'
import { Button } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'
import { Filter } from 'lucide-react'

export const FilterToggle = ({ className, label, isActive, onToggle }) => {
  return (
    <Button
      variant='outline'
      aria-expanded={isActive}
      onClick={onToggle}
      className={cn(className)}
    >
      <Filter className='size-4' />
      <span className='hidden sm:inline'>{label}</span>
      <ChevronIcon className='hidden group-aria-expanded/button:rotate-180 sm:block' />
    </Button>
  )
}
