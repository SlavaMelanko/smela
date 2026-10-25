import { Header } from '@ui/components/Header'
import { Sidebar } from '@ui/components/Sidebar'
import { Spinner } from '@ui/components/Spinner'
import {
  readSidebarOpen,
  SidebarInset,
  SidebarProvider
} from '@ui/components/ui'
import { NotificationProvider } from '@ui/contexts/NotificationContext'
import { useCreateUserTeam } from '@ui/hooks/useCreateUserTeam'
import { Outlet } from '@ui/hooks/useRouter'
import { useSidebarMenu } from '@ui/hooks/useSidebarMenu'
import { useUserTeams } from '@ui/hooks/useUserTeams'
import { Suspense } from 'react'

export const UserLayout = () => {
  const { items, teams, invites } = useSidebarMenu()
  const { openCreateTeamDialog } = useCreateUserTeam()
  const { switchTeam, acceptInvite, declineInvite } = useUserTeams()

  return (
    <NotificationProvider>
      <SidebarProvider defaultOpen={readSidebarOpen()}>
        <Sidebar
          items={items}
          teams={teams}
          invites={invites}
          onTeamChange={switchTeam}
          onAcceptInvite={acceptInvite}
          onDeclineInvite={declineInvite}
          onCreateTeam={openCreateTeamDialog}
        />
        <SidebarInset>
          <header className='flex shrink-0 items-center z-10 h-11.25 px-4 md:px-8 bg-sidebar border-b border-sidebar-border'>
            <Header />
          </header>

          <main className='flex flex-col flex-1 overflow-auto p-4 md:p-6 lg:p-8 lg:mx-auto lg:max-w-7xl lg:w-full'>
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NotificationProvider>
  )
}
