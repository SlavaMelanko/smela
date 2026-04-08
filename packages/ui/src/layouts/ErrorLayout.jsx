import { Copyright } from '@ui/components/Copyright'
import { LanguageDropdown } from '@ui/components/LanguageDropdown'
import { Spinner } from '@ui/components/Spinner'
import { ThemeToggle } from '@ui/components/ThemeToggle'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

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
