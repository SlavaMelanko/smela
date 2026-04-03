import { Plus } from 'lucide-react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export const AddButton = ({
  label,
  onClick,
  hideTextOnMobile = true,
  className
}) => (
  <Button onClick={onClick} aria-label={label} className={className}>
    <Plus className='size-4' />
    <span className={cn(hideTextOnMobile && 'hidden sm:inline')}>{label}</span>
  </Button>
)
