import { Bell } from 'lucide-react'

import { Badge, Button } from '@/components/ui'

export const NotificationToggle = ({ unreadCount = 0, onClick, ref }) => (
  <Button
    variant='ghost'
    size='icon'
    className='relative rounded-full'
    onClick={onClick}
    ref={ref}
  >
    <Bell className='size-6' />
    {unreadCount > 0 && (
      <Badge variant='notification' className='absolute top-0.5 right-0'>
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    )}
  </Button>
)
