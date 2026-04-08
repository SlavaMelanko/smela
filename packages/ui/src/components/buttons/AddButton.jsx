import { Button } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'
import { Plus } from 'lucide-react'

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
