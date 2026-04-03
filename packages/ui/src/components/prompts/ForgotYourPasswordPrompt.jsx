import { Link } from '@/components/links'
import { useLocale } from '@/hooks/useLocale'

import { Prompt } from './Prompt'

export const ForgotYourPasswordPrompt = ({ size = 'sm' }) => {
  const { t } = useLocale()

  return (
    <Prompt size={size}>
      <Link size={size} to='/reset-password'>
        {t('forgotYourPassword')}
      </Link>
    </Prompt>
  )
}
