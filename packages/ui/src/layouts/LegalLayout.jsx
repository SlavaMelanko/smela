import { Copyright } from '@ui/components/Copyright'
import { Logo } from '@ui/components/icons'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { Spinner } from '@ui/components/Spinner'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { LayoutContent, LayoutRoot, LayoutTopRightControls } from './Layout'

export const LegalLayout = () => (
  <LayoutRoot>
    <LayoutTopRightControls>
      <ThemeToggle />
      <LanguageDropdown />
    </LayoutTopRightControls>

    <LayoutContent className='grow max-w-5xl'>
      <header className='flex items-center justify-center text-foreground'>
        <Logo size='lg' />
      </header>

      <main className='grow w-full p-4'>
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
