import { Copyright } from '@ui/components/Copyright'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { Spinner } from '@ui/components/Spinner'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { Outlet } from '@ui/hooks/useRouter'
import { Suspense } from 'react'

import { LayoutContent, LayoutRoot, LayoutTopRightControls } from './Layout'

export const ErrorLayout = ({ children }) => (
  <LayoutRoot>
    <LayoutTopRightControls>
      <ThemeToggle />
      <LanguageDropdown />
    </LayoutTopRightControls>

    <LayoutContent className='max-w-md'>
      <main className='px-8'>
        <Suspense fallback={<Spinner />}>{children ?? <Outlet />}</Suspense>
      </main>

      <footer>
        <Copyright />
      </footer>
    </LayoutContent>
  </LayoutRoot>
)
