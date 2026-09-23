import { PageContent } from '@ui/components/PageContent'

import { useWelcomeToast } from './useWelcomeToast'

export const HomePage = () => {
  useWelcomeToast()

  return (
    <PageContent>
      <h1 className='text-xl font-bold'>Home</h1>
    </PageContent>
  )
}
