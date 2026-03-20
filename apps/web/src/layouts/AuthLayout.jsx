import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { Copyright } from '@/components/Copyright'
import { Logo } from '@/components/icons'
import { LanguageDropdown } from '@/components/LanguageDropdown'
import { Spinner } from '@/components/Spinner'
import { ThemeToggle } from '@/components/ThemeToggle'

import { LayoutContent, LayoutRoot, LayoutTopRightControls } from './Layout'

export const AuthLayout = () => (
  <LayoutRoot>
    <LayoutTopRightControls>
      <ThemeToggle />
      <LanguageDropdown />
    </LayoutTopRightControls>

    <LayoutContent className='max-w-md'>
      <header className='flex items-center justify-center text-foreground'>
        <Logo size='lg' />
      </header>

      <main className='px-4 md:px-8 lg:px-12'>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer>
        <Copyright />
      </footer>
    </LayoutContent>
  </LayoutRoot>
)
