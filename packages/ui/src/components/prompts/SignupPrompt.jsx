import { Link } from '@ui/components/links'
import { useLocale } from '@ui/hooks/useLocale'

import { Prompt } from './Prompt'

export const SignupPrompt = ({ size = 'sm' }) => {
  const { t } = useLocale()

  return (
    <Prompt size={size}>
      <span>{t('doNotHaveAccount')}</span>
      <Link size={size} to='/pricing'>
        {t('signUp')}
      </Link>
    </Prompt>
  )
}
