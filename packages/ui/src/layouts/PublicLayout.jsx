import { Copyright } from '@ui/components/Copyright'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { Spinner } from '@ui/components/Spinner'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { LayoutContent, LayoutRoot, LayoutTopRightControls } from './Layout'

export const PublicLayout = () => (
  <LayoutRoot>
    <LayoutTopRightControls>
      <ThemeToggle />
      <LanguageDropdown />
    </LayoutTopRightControls>

    <LayoutContent className='max-w-7xl'>
      <main className='mt-16'>
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
