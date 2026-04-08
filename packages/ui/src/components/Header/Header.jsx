import { Logo } from '@ui/components/icons'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { NotificationToggle } from '@ui/components/notifications'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { SidebarTrigger } from '@ui/components/ui'
import { useCurrentUser } from '@ui/hooks/useAuth'
import { useNotifications } from '@ui/hooks/useNotifications'

import { UserProfileDropdown } from './UserProfileDropdown'

export const Header = () => {
  const { user: me } = useCurrentUser()
  const { inboxNotifications, openNotificationPanel } = useNotifications()

  return (
    <header className='flex items-center justify-between gap-4 w-full h-11 bg-sidebar md:justify-end'>
      <div className='flex items-center gap-2 md:hidden'>
        <SidebarTrigger />
        <Logo />
      </div>

      <nav className='flex items-center gap-2'>
        <NotificationToggle
          unreadCount={inboxNotifications?.length || 0}
          onClick={openNotificationPanel}
        />

        <div className='hidden md:flex items-center gap-2'>
          <ThemeToggle />
          <LanguageDropdown />
        </div>

        <UserProfileDropdown user={me} />
      </nav>
    </header>
  )
}
