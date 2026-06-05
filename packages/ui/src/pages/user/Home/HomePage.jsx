import { PageContent } from '@ui/components/PageContent'
import { useLocale } from '@ui/hooks/useLocale'
import { useLocation } from '@ui/hooks/useRouter'
import { useToast } from '@ui/hooks/useToast'
import { useEffect } from 'react'

export const HomePage = () => {
  const { t } = useLocale()
  const { showSuccessToast } = useToast()
  const { state: { showWelcome } = {} } = useLocation()

  // Show welcome toast after successful social OAuth signup
  useEffect(() => {
    if (showWelcome) {
      showSuccessToast(t('email.verification.success'))
    }
  }, [showWelcome, showSuccessToast, t])

  return (
    <PageContent>
      <h1 className='text-xl font-bold'>Home</h1>
    </PageContent>
  )
}
