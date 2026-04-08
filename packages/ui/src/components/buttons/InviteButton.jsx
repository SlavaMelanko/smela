import { Button } from '@ui/components/ui'
import { cn } from '@ui/lib/utils'
import { UserRoundPlus } from 'lucide-react'

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
