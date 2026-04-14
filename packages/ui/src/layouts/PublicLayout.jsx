import { Copyright } from '@ui/components/Copyright'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { Spinner } from '@ui/components/Spinner'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { Outlet } from '@ui/hooks/useRouter'
import { Suspense } from 'react'

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
