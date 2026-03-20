import { UserRoundPlus } from 'lucide-react'

import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export const InviteButton = ({
  label,
  onClick,
  hideTextOnMobile = true,
  className
}) => (
  <Button onClick={onClick} aria-label={label} className={className}>
    <UserRoundPlus className='size-4' />
    <span className={cn(hideTextOnMobile && 'hidden sm:inline')}>{label}</span>
  </Button>
)
