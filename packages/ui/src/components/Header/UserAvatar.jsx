import { Avatar, AvatarFallback, AvatarStatus } from '@ui/components/ui'
import { getStatusBgColor } from '@ui/components/UserStatus'

export const UserAvatar = ({ nickname, status }) => (
  <Avatar className='size-6 overflow-visible'>
    <AvatarFallback className='text-lg'>
      {Array.from(nickname ?? '')[0] || '?'}
    </AvatarFallback>
    {status && <AvatarStatus color={getStatusBgColor(status)} />}
  </Avatar>
)
