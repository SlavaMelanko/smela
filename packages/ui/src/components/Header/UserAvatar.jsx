import { Avatar, AvatarFallback, AvatarStatus } from '@/components/ui'
import { getStatusBgColor } from '@/components/UserStatus'

export const UserAvatar = ({ firstName, status }) => (
  <Avatar className='size-6 overflow-visible'>
    <AvatarFallback className='text-lg'>{firstName?.[0] || '?'}</AvatarFallback>
    {status && <AvatarStatus color={getStatusBgColor(status)} />}
  </Avatar>
)
