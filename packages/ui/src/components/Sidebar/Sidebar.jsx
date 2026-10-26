import { Copyright } from '@ui/components/Copyright'
import { Logo } from '@ui/components/icons'
import { TeamSwitcher } from '@ui/components/TeamSwitcher'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar
} from '@ui/components/ui'

import { NavMenu } from './NavMenu'
import { SidebarToggle } from './SidebarToggle'

export const Sidebar = ({
  items,
  teams,
  invites,
  onTeamChange,
  onCreateTeam,
  onAcceptInvite,
  onDeclineInvite
}) => {
  const { state, isMobile } = useSidebar()
  const compact = state === 'collapsed' && !isMobile

  return (
    <ShadcnSidebar collapsible='icon'>
      <SidebarHeader className='h-11 items-center justify-center'>
        <Logo size={compact ? 'icon' : 'sm'} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavMenu items={items} compact={compact} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {teams && (
          <TeamSwitcher
            compact={compact}
            teams={teams}
            invites={invites}
            onTeamChange={onTeamChange}
            onCreateTeam={onCreateTeam}
            onAcceptInvite={onAcceptInvite}
            onDeclineInvite={onDeclineInvite}
          />
        )}
        <div className='relative flex h-6 items-center justify-center'>
          {!isMobile && (
            <SidebarToggle
              compact={compact}
              className={!compact && 'absolute left-0 top-1/2 -translate-y-1/2'}
            />
          )}
          {!compact && <Copyright />}
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
