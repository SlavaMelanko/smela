import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Spinner } from '@/components/Spinner'
import { SidebarInset, SidebarProvider } from '@/components/ui'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { useSidebarMenu } from '@/hooks/useSidebarMenu'

export const UserLayout = () => {
  const { items, team } = useSidebarMenu()

  return (
    <NotificationProvider>
      <SidebarProvider>
        <Sidebar items={items} team={team} />
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
