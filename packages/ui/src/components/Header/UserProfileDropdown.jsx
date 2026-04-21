import { useLogout } from '@ui/hooks/useAuth'
import { useNavigate } from '@ui/hooks/useRouter'
import { isAdmin } from '@ui/lib/types'
import { LogOut, MessageCircleQuestion, User } from 'lucide-react'

import { ProfileDropdown } from './ProfileDropdown'

const getProfilePath = role => {
  if (isAdmin(role)) {
    return '/admin/profile'
  }

  return '/profile'
}

export const UserProfileDropdown = ({ user }) => {
  const navigate = useNavigate()
  const { mutate: logOut } = useLogout()

  const handleLogOut = () => {
    logOut(undefined, {
      onSuccess: () => {
        navigate('/login')
      }
    })
  }

  const menu = [
    {
      label: 'profile.title',
      icon: <User className='size-4' />,
      onClick: () => {
        navigate(getProfilePath(user?.role))
      }
    },
    {
      label: 'support',
      icon: <MessageCircleQuestion className='size-4' />,
      onClick: () => {
        navigate('/support')
      }
    },
    {
      label: 'logout.noun',
      icon: <LogOut className='size-4 text-destructive' />,
      onClick: handleLogOut,
      separatorBefore: true,
      danger: true
    }
  ]

  return (
    <ProfileDropdown
      firstName={user?.firstName}
      status={user?.status}
      menu={menu}
    />
  )
}
