import { Copyright } from '@ui/components/Copyright'
import { Logo } from '@ui/components/icons'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { Spinner } from '@ui/components/Spinner'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { Outlet } from '@ui/hooks/useRouter'
import { Suspense } from 'react'

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
